import { createTRPCRouter, publicProcedure } from "../trpc";
import {
    getTableDataInputSchema,
    getTableDataOutputSchema,
} from "~/types/tableData";

export const tableDataRouter = createTRPCRouter({
    /**
     * Returns all columns (ordered) and all rows with their cells for a table.
     * This is the main query that powers the grid view.
     */
    getTableData: publicProcedure
        .input(getTableDataInputSchema)
        .output(getTableDataOutputSchema)
        .query(async ({ ctx, input }) => {
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
                    where: { tableId: input.tableId },
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

            return { columns, rows };
        }),
});
