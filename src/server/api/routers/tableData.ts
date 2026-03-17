import { Prisma } from "../../../../generated/prisma";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
    getTableDataInputSchema,
    getTableDataOutputSchema,
} from "~/types/tableData";

async function getSortedRowIds(
    db: { $queryRawUnsafe: (query: string, ...values: unknown[]) => Promise<unknown> },
    rowIds: string[],
    sortOrder: { columnId: string; direction: string }[],
): Promise<{ id: string }[]> {
    if (rowIds.length === 0 || sortOrder.length === 0) return [];

    const joinClauses: string[] = [];
    const orderByParts: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    for (let i = 0; i < sortOrder.length; i++) {
        const s = sortOrder[i]!;
        const dir = s.direction === "desc" ? "DESC" : "ASC";
        joinClauses.push(`LEFT JOIN "Cell" c${i} ON c${i}."rowId" = r.id AND c${i}."columnId" = $${paramIndex}`);
        params.push(s.columnId);
        paramIndex++;
        orderByParts.push(`COALESCE(c${i}.value, '') ${dir} NULLS LAST`);
    }
    orderByParts.push('r."order" ASC');

    const query = `
        SELECT r.id
        FROM "Row" r
        ${joinClauses.join("\n        ")}
        WHERE r.id = ANY($${paramIndex}::text[])
        ORDER BY ${orderByParts.join(", ")}
    `;
    params.push(rowIds);

    const result = await db.$queryRawUnsafe(query, ...params);
    return result as { id: string }[];
}

function buildFilterWhere(filter: {
    columnId: string;
    operator: string;
    value: string | null;
}): Prisma.RowWhereInput {
    switch (filter.operator) {
        case "contains":
            return {
                cells: {
                    some: {
                        columnId: filter.columnId,
                        value: { contains: filter.value ?? "", mode: "insensitive" },
                    },
                },
            };
        case "not_contains":
            return {
                NOT: {
                    cells: {
                        some: {
                            columnId: filter.columnId,
                            value: { contains: filter.value ?? "", mode: "insensitive" },
                        },
                    },
                },
            };
        case "equals":
            return {
                cells: {
                    some: { columnId: filter.columnId, value: filter.value },
                },
            };
        case "not_equals":
            return {
                NOT: {
                    cells: {
                        some: { columnId: filter.columnId, value: filter.value },
                    },
                },
            };
        case "is_empty":
            return {
                OR: [
                    { cells: { none: { columnId: filter.columnId } } },
                    { cells: { some: { columnId: filter.columnId, value: null } } },
                    { cells: { some: { columnId: filter.columnId, value: "" } } },
                ],
            };
        case "is_not_empty":
            return {
                cells: {
                    some: {
                        columnId: filter.columnId,
                        value: { not: null },
                        AND: { value: { not: "" } },
                    },
                },
            };
        default:
            return {};
    }
}

export const tableDataRouter = createTRPCRouter({
    /**
     * Returns all columns (ordered) and rows with their cells for a table.
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
            let searchQuery: string | null = null;
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
                    searchQuery   = view.searchQuery;
                    hiddenColumnIds = view.hiddenColumns.map((h) => h.columnId);
                }
            }

            const rowWhere: Prisma.RowWhereInput = {
                tableId: input.tableId,
                ...(viewFilters.length > 0 && {
                    AND: viewFilters.map((f) => buildFilterWhere(f)),
                }),
            };

            const [columns, rows] = await Promise.all([
                ctx.db.column.findMany({
                    where: { tableId: input.tableId },
                    orderBy: { order: "asc" },
                    select: {
                        id:     true,
                        name:   true,
                        type:   true,
                        order:  true,
                        config: true,
                    },
                }),
                ctx.db.row.findMany({
                    where: rowWhere,
                    orderBy: { order: "asc" },
                    select: {
                        id:    true,
                        order: true,
                        cells: {
                            select: {
                                columnId: true,
                                value:    true,
                            },
                        },
                    },
                }),
            ]);

            // Apply search across all cell values
            let filteredRows = rows;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                filteredRows = rows.filter((row) =>
                    row.cells.some((cell) => cell.value?.toLowerCase().includes(q)),
                );
            }

            // Apply sorts in DB (groups first, then view sorts)
            const sortOrder = [
                ...viewGroups.map((g) => ({ columnId: g.columnId, direction: g.direction })),
                ...viewSorts.map((s) => ({ columnId: s.columnId, direction: s.direction })),
            ];
            if (sortOrder.length > 0 && filteredRows.length > 0) {
                const rowIds = filteredRows.map((r) => r.id);
                const sortedIds = await getSortedRowIds(ctx.db, rowIds, sortOrder);
                const idToIndex = new Map(sortedIds.map((r, i) => [r.id, i]));
                filteredRows = [...filteredRows].sort(
                    (a, b) => (idToIndex.get(a.id) ?? 0) - (idToIndex.get(b.id) ?? 0),
                );
            }

            return {
                columns,
                rows: filteredRows,
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
