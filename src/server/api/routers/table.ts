import { createTRPCRouter, publicProcedure } from "../trpc";
import { getTablesByBaseIdSchema, getTablesByBaseIdOutputSchema } from "~/types/table";

export const tableRouter = createTRPCRouter({
    getByBaseId: publicProcedure
        .input(getTablesByBaseIdSchema)
        .output(getTablesByBaseIdOutputSchema)
        .query(async ({ ctx, input }) => {
            return ctx.db.table.findMany({
                where: { baseId: input.baseId },
                orderBy: { order: "asc" },
            });
        }),
});
