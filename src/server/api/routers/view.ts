import { createTRPCRouter, publicProcedure } from "../trpc";
import {
    getViewsByTableIdSchema,
    getViewsByTableIdOutputSchema,
    getViewByIdSchema,
    viewWithConfigSchema,
    createViewSchema,
    updateViewGroupsSchema,
} from "~/types/view";

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

    getById: publicProcedure
        .input(getViewByIdSchema)
        .output(viewWithConfigSchema)
        .query(async ({ ctx, input }) => {
            const view = await ctx.db.view.findUniqueOrThrow({
                where: { id: input.viewId },
                include: {
                    filters: { orderBy: { order: "asc" } },
                    sorts:   { orderBy: { order: "asc" } },
                    groups:  { orderBy: { order: "asc" } },
                },
            });
            return view;
        }),

    create: publicProcedure
        .input(createViewSchema)
        .mutation(async ({input, ctx})=> {
            const view = await ctx.db.view.create({
                data: {
                    name: input.name,
                    type: input.type,
                    tableId: input.tableId,
                    createdById: input.createdById,
                },
            })
            return view

        }),

    updateGroups: publicProcedure
        .input(updateViewGroupsSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.db.$transaction(async (tx) => {
                await tx.viewGroup.deleteMany({ where: { viewId: input.viewId } });
                if (input.groups?.length) {
                    await tx.viewGroup.createMany({
                        data: input.groups.map((g, i) => ({
                            viewId: input.viewId,
                            columnId: g.columnId,
                            direction: g.direction,
                            order: i,
                        })),
                    });
                }
            });
            return ctx.db.view.findUniqueOrThrow({
                where: { id: input.viewId },
                include: {
                    filters: { orderBy: { order: "asc" } },
                    sorts:   { orderBy: { order: "asc" } },
                    groups:  { orderBy: { order: "asc" } },
                },
            });
        }),
});
