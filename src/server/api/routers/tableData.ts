import { Prisma } from "../../../../generated/prisma";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
    getTableDataInputSchema,
    getTableDataOutputSchema,
} from "~/types/tableData";

export const tableDataRouter = createTRPCRouter({
    /**
     * Returns column metadata and view configuration.
     * Row data is now fetched via record.list endpoint.
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

            // Return metadata only - rows are fetched via record.list
            return {
                columns,
                rows: [], // Empty array - rows now come from record.list
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
