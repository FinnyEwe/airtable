import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

const createRowSchema = z.object({
  tableId: z.string().cuid(),
  createdById: z.string(),
});

export const rowRouter = createTRPCRouter({
  create: publicProcedure
    .input(createRowSchema)
    .mutation(async ({ ctx, input }) => {
      const lastRow = await ctx.db.row.findFirst({
        where: { tableId: input.tableId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const nextOrder = (lastRow?.order ?? -1) + 1;

      return ctx.db.row.create({
        data: {
          order: nextOrder,
          tableId: input.tableId,
          createdById: input.createdById,
        },
      });
    }),
});
