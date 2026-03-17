import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import {
    getViewsByTableIdSchema,
    getViewsByTableIdOutputSchema,
    getViewByIdSchema,
    viewWithConfigSchema,
    createViewSchema,
    updateViewGroupsSchema,
    updateColumnVisibilitySchema,
    updateViewFiltersSchema,
    updateViewSortsSchema,
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
                    filters:        { orderBy: { order: "asc" } },
                    sorts:          { orderBy: { order: "asc" } },
                    groups:         { orderBy: { order: "asc" } },
                    hiddenColumns:  true,
                },
            });
            return view;
        }),

    create: protectedProcedure
        .input(createViewSchema)
        .mutation(async ({input, ctx})=> {
            const view = await ctx.db.view.create({
                data: {
                    name: input.name,
                    type: input.type,
                    tableId: input.tableId,
                },
            })
            return view

        }),

    updateGroups: protectedProcedure
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
                    filters:        { orderBy: { order: "asc" } },
                    sorts:          { orderBy: { order: "asc" } },
                    groups:         { orderBy: { order: "asc" } },
                    hiddenColumns:  true,
                },
            });
        }),

    updateColumnVisibility: protectedProcedure
        .input(updateColumnVisibilitySchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.db.$transaction(async (tx) => {
                await tx.viewColumnVisibility.deleteMany({ where: { viewId: input.viewId } });
                if (input.hiddenColumnIds.length > 0) {
                    await tx.viewColumnVisibility.createMany({
                        data: input.hiddenColumnIds.map((columnId) => ({
                            viewId: input.viewId,
                            columnId,
                        })),
                    });
                }
            });
            return { success: true };
        }),

    updateFilters: protectedProcedure
        .input(updateViewFiltersSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.db.$transaction(async (tx) => {
                await tx.viewFilter.deleteMany({ where: { viewId: input.viewId } });
                if (input.filters.length > 0) {
                    await tx.viewFilter.createMany({
                        data: input.filters.map((f, i) => ({
                            viewId: input.viewId,
                            columnId: f.columnId,
                            operator: f.operator,
                            value: f.value,
                            order: i,
                        })),
                    });
                }
            });
            return { success: true };
        }),

    updateSorts: protectedProcedure
        .input(updateViewSortsSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.db.$transaction(async (tx) => {
                await tx.viewSort.deleteMany({ where: { viewId: input.viewId } });
                if (input.sorts.length > 0) {
                    await tx.viewSort.createMany({
                        data: input.sorts.map((s, i) => ({
                            viewId: input.viewId,
                            columnId: s.columnId,
                            direction: s.direction,
                            order: i,
                        })),
                    });
                }
            });
            return ctx.db.view.findUniqueOrThrow({
                where: { id: input.viewId },
                include: {
                    filters:        { orderBy: { order: "asc" } },
                    sorts:          { orderBy: { order: "asc" } },
                    groups:         { orderBy: { order: "asc" } },
                    hiddenColumns:  true,
                },
            });
        }),
});
