import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { getTablesByBaseIdSchema, getTablesByBaseIdOutputSchema, createTableSchema, tableSchema } from "~/types/table";

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

    create: protectedProcedure
        .input(createTableSchema)
        .output(tableSchema)
        .mutation(async ({ ctx, input }) => {
            const existingTables = await ctx.db.table.findMany({
                where: { baseId: input.baseId },
                orderBy: { order: "desc" },
                take: 1,
            });

            const nextOrder = existingTables.length > 0 && existingTables[0] ? existingTables[0].order + 1 : 0;

            const table = await ctx.db.table.create({
                data: {
                    name: input.name,
                    order: nextOrder,
                    baseId: input.baseId,
                },
            });

            const defaultColumns = [
                { name: "Name", type: "text", order: 0 },
                { name: "Notes", type: "multilineText", order: 1 },
                { name: "Assignee", type: "collaborator", order: 2 },
                { name: "Status", type: "select", order: 3, config: JSON.stringify({ options: ["Todo", "In Progress", "Done"] }) },
                { name: "Attachments", type: "multipleAttachment", order: 4 },
                { name: "Attachment Summary", type: "aiText", order: 5 },
            ];

            await Promise.all(
                defaultColumns.map((col) =>
                    ctx.db.column.create({
                        data: {
                            name: col.name,
                            type: col.type,
                            order: col.order,
                            config: col.config ?? null,
                            tableId: table.id,
                        },
                    })
                )
            );

            const defaultView = await ctx.db.view.create({
                data: {
                    name: "Grid view",
                    type: "grid",
                    order: 0,
                    tableId: table.id,
                },
            });

            const defaultRows = Array.from({ length: 3 }, (_, i) => i);
            await Promise.all(
                defaultRows.map((i) =>
                    ctx.db.row.create({
                        data: {
                            order: i,
                            tableId: table.id,
                        },
                    })
                )
            );

            return table;
        }),
});
