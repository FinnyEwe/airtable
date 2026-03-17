import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

const createRowSchema = z.object({
  tableId: z.string().cuid(),
});

const deleteRowSchema = z.object({
  rowId: z.string().cuid(),
});

export const rowRouter = createTRPCRouter({
  create: protectedProcedure
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
        },
      });
    }),
  delete: protectedProcedure
    .input(deleteRowSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.row.delete({
        where: { id: input.rowId },
      });
    }),
});
