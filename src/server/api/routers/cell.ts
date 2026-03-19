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
      // Update the JSONB data column by merging the new value
      await ctx.db.$executeRaw`
        UPDATE "Row"
        SET data = COALESCE(data, '{}'::jsonb) || jsonb_build_object(${input.columnId}, ${input.value})
        WHERE id = ${input.rowId}
      `;
      
      return { success: true };
    }),
});
