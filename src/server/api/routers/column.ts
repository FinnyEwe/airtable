import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

const createColumnSchema = z.object({
  name: z.string().default("Untitled"),
  type: z.string().default("text"),
  tableId: z.string().cuid(),
  createdById: z.string(),
});

export const columnRouter = createTRPCRouter({
  create: publicProcedure
    .input(createColumnSchema)
    .mutation(async ({ ctx, input }) => {
      const lastColumn = await ctx.db.column.findFirst({
        where: { tableId: input.tableId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const nextOrder = (lastColumn?.order ?? -1) + 1;

      return ctx.db.column.create({
        data: {
          name: input.name,
          type: input.type,
          order: nextOrder,
          tableId: input.tableId,
          createdById: input.createdById,
        },
      });
    }),
});
