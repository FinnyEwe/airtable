import { createTRPCRouter, publicProcedure } from "../trpc";
import { getViewsByTableIdSchema, getViewsByTableIdOutputSchema } from "~/types/view";

export const viewRouter = createTRPCRouter({
    getByTableId: publicProcedure
        .input(getViewsByTableIdSchema)
        .output(getViewsByTableIdOutputSchema)
        .query(async ({ ctx, input }) => {
            return ctx.db.view.findMany({
                where: { tableId: input.tableId },
                orderBy: { order: "asc" },
            });
        }),
});
