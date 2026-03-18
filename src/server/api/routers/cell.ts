import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const updateCellSchema = z.object({
  rowId: z.string().cuid(),
  columnId: z.string().cuid(),
  value: z.string().nullable(),
});

export const cellRouter = createTRPCRouter({
  update: protectedProcedure
    .input(updateCellSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cell.upsert({
        where: {
          rowId_columnId: {
            rowId: input.rowId,
            columnId: input.columnId,
          },
        },
        update: {
          value: input.value,
        },
        create: {
          rowId: input.rowId,
          columnId: input.columnId,
          value: input.value,
        },
      });
    }),
});
