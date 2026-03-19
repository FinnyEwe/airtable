import { Prisma } from "../../../../generated/prisma";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
    getTableDataInputSchema,
    getTableDataOutputSchema,
} from "~/types/tableData";

export const tableDataRouter = createTRPCRouter({
    /**
     * Returns all columns (ordered) and rows with their JSONB data for a table.
     * When a viewId is provided, the view's filters, sorts, and search are applied.
     */
    getTableData: publicProcedure
        .input(getTableDataInputSchema)
        .output(getTableDataOutputSchema)
        .query(async ({ ctx, input }) => {
            type ViewFilter = { id: string; columnId: string; operator: string; value: string | null; order: number };
            type ViewSort   = { columnId: string; direction: string; order: number };

            let viewFilters: ViewFilter[] = [];
            let viewSorts: ViewSort[]     = [];
            let hiddenColumnIds: string[] = [];
            let viewGroups: { columnId: string; direction: string; order: number }[] = [];

            if (input.viewId) {
                const view = await ctx.db.view.findUnique({
                    where: { id: input.viewId },
                    include: {
                        filters:         { orderBy: { order: "asc" } },
                        sorts:          { orderBy: { order: "asc" } },
                        groups:         { orderBy: { order: "asc" } },
                        hiddenColumns:  true,
                    },
                });
                if (view) {
                    viewFilters    = view.filters;
                    viewSorts      = view.sorts;
                    viewGroups     = view.groups;
                    hiddenColumnIds = view.hiddenColumns.map((h) => h.columnId);
                }
            }

            const columns = await ctx.db.column.findMany({
                where: { tableId: input.tableId },
                orderBy: { order: "asc" },
                select: {
                    id:     true,
                    name:   true,
                    type:   true,
                    order:  true,
                    config: true,
                },
            });

            const search = input.search?.trim();
            
            // Build WHERE conditions
            const whereConditions: string[] = [`"tableId" = '${input.tableId}'`];
            const whereParams: unknown[] = [];
            
            for (const filter of viewFilters) {
                const { columnId, operator, value } = filter;
                const jsonPath = `jsonb_extract_path_text(data, '${columnId}')`;
                
                switch (operator) {
                    case "contains":
                        if (value) {
                            whereConditions.push(`${jsonPath} ILIKE '%${value}%'`);
                        }
                        break;
                    case "not_contains":
                        if (value) {
                            whereConditions.push(`(${jsonPath} IS NULL OR ${jsonPath} NOT ILIKE '%${value}%')`);
                        }
                        break;
                    case "equals":
                        whereConditions.push(`${jsonPath} = '${value}'`);
                        break;
                    case "not_equals":
                        whereConditions.push(`(${jsonPath} IS NULL OR ${jsonPath} != '${value}')`);
                        break;
                    case "is_empty":
                        whereConditions.push(`(${jsonPath} IS NULL OR ${jsonPath} = '')`);
                        break;
                    case "is_not_empty":
                        whereConditions.push(`${jsonPath} IS NOT NULL AND ${jsonPath} != ''`);
                        break;
                    case "gt":
                        if (value) {
                            whereConditions.push(`(${jsonPath})::numeric > ${parseFloat(value)}`);
                        }
                        break;
                    case "lt":
                        if (value) {
                            whereConditions.push(`(${jsonPath})::numeric < ${parseFloat(value)}`);
                        }
                        break;
                }
            }
            
            if (search) {
                whereConditions.push(`EXISTS (
                    SELECT 1 FROM jsonb_each_text(data) AS kv
                    WHERE kv.value ILIKE '%${search}%'
                )`);
            }

            const whereClause = whereConditions.join(' AND ');

            // Apply sorts (groups first, then view sorts)
            const sortOrder = [
                ...viewGroups.map((g) => ({ columnId: g.columnId, direction: g.direction })),
                ...viewSorts.map((s) => ({ columnId: s.columnId, direction: s.direction })),
            ];
            
            // Build ORDER BY clause
            let orderByClause: string;
            if (sortOrder.length === 0) {
                orderByClause = '"order" ASC';
            } else {
                const orderParts: string[] = [];
                for (const sort of sortOrder) {
                    const dir = sort.direction === "desc" ? "DESC" : "ASC";
                    // Numeric sorting with fallback
                    orderParts.push(
                        `COALESCE(
                            CASE WHEN jsonb_extract_path_text(data, '${sort.columnId}') ~ '^-?[0-9]+\\.?[0-9]*$'
                            THEN (jsonb_extract_path_text(data, '${sort.columnId}'))::numeric
                            END, 0
                        ) ${dir} NULLS LAST`
                    );
                    orderParts.push(`jsonb_extract_path_text(data, '${sort.columnId}') ${dir} NULLS LAST`);
                }
                orderParts.push('"order" ASC');
                orderByClause = orderParts.join(', ');
            }

            // Query rows with JSONB data using $queryRawUnsafe
            const rows = await ctx.db.$queryRawUnsafe<
                Array<{ id: string; order: number; data: Record<string, unknown> | null }>
            >(
                `SELECT id, "order", data FROM "Row" WHERE ${whereClause} ORDER BY ${orderByClause}`
            );

            // Transform JSONB data back to cells format for compatibility
            const transformedRows = rows.map(row => ({
                id: row.id,
                order: row.order,
                cells: Object.entries(row.data ?? {}).map(([columnId, value]) => ({
                    columnId,
                    value: value as string | null,
                })),
            }));

            return {
                columns,
                rows: transformedRows,
                groups: viewGroups,
                hiddenColumnIds,
                filters: viewFilters.map((f) => ({
                    id: f.id,
                    columnId: f.columnId,
                    operator: f.operator,
                    value: f.value,
                    order: f.order,
                })),
            };
        }),
});
