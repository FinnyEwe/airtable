import { type Prisma } from "../../../../generated/prisma";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
    getTableDataInputSchema,
    getTableDataOutputSchema,
} from "~/types/tableData";

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
            type ViewFilter = { columnId: string; operator: string; value: string | null; order: number };
            type ViewSort   = { columnId: string; direction: string; order: number };

            let viewFilters: ViewFilter[] = [];
            let viewSorts: ViewSort[]     = [];
            let searchQuery: string | null = null;

            if (input.viewId) {
                const view = await ctx.db.view.findUnique({
                    where: { id: input.viewId },
                    include: {
                        filters: { orderBy: { order: "asc" } },
                        sorts:   { orderBy: { order: "asc" } },
                    },
                });
                if (view) {
                    viewFilters = view.filters;
                    viewSorts   = view.sorts;
                    searchQuery = view.searchQuery;
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

            // Apply sorts in JS (avoids complex SQL on related cells)
            if (viewSorts.length > 0) {
                filteredRows.sort((a, b) => {
                    for (const sort of viewSorts) {
                        const aVal = a.cells.find((c) => c.columnId === sort.columnId)?.value ?? "";
                        const bVal = b.cells.find((c) => c.columnId === sort.columnId)?.value ?? "";
                        const cmp = aVal.localeCompare(bVal);
                        if (cmp !== 0) return sort.direction === "asc" ? cmp : -cmp;
                    }
                    return 0;
                });
            }

            return { columns, rows: filteredRows };
        }),
});
