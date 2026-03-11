import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
    createBaseSchema,
    getBaseByIdSchema,
    getBaseByIdOutputSchema,
    getAllBasesOutputSchema,
    baseSchema,
} from "~/types/base";

export const baseRouter = createTRPCRouter({
    getAll: publicProcedure
        .output(getAllBasesOutputSchema)
        .query(async ({ ctx }) => {
            return ctx.db.base.findMany({
                where: { createdById: ctx.session?.user?.id },
                orderBy: { createdAt: "desc" },
            });
        }),

    getById: publicProcedure
        .input(getBaseByIdSchema)
        .output(getBaseByIdOutputSchema)
        .query(async ({ ctx, input }) => {
            const base = await ctx.db.base.findUnique({
                where: { id: input.id },
            });

            if (!base) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Base with id "${input.id}" not found`,
                });
            }

            return base;
        }),

    create: publicProcedure
        .input(createBaseSchema)
        .output(baseSchema)
        .mutation(async ({ ctx, input }) => {
            return ctx.db.base.create({
                data: {
                    ...input,
                    createdById: ctx.session?.user?.id!,
                },
            });
        }),
});
