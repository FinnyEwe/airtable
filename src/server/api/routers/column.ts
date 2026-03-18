import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const createColumnSchema = z.object({
  name: z.string().default("Untitled"),
  type: z.string().default("text"),
  tableId: z.string().cuid(),
});

const deleteColumnSchema = z.object({
  columnId: z.string().cuid(),
});

export const columnRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createColumnSchema)
    .mutation(async ({ ctx, input }) => {
      const lastColumn = await ctx.db.column.findFirst({
        where: { tableId: input.tableId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const nextOrder = (lastColumn?.order ?? -1) + 1;

      // Generate unique name if "Untitled" already exists
      let columnName = input.name;
      if (columnName === "Untitled") {
        const existingColumns = await ctx.db.column.findMany({
          where: { 
            tableId: input.tableId,
            name: { startsWith: "Untitled" }
          },
          select: { name: true },
        });
        
        if (existingColumns.length > 0) {
          const numbers = existingColumns
            .map(c => {
              const match = c.name.match(/^Untitled(?: (\d+))?$/);
              return match ? (match[1] ? parseInt(match[1]) : 1) : 0;
            })
            .filter(n => n > 0);
          
          const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
          columnName = `Untitled ${maxNum + 1}`;
        }
      }

      return ctx.db.column.create({
        data: {
          name: columnName,
          type: input.type,
          order: nextOrder,
          tableId: input.tableId,
        },
      });
    }),
  delete: protectedProcedure
    .input(deleteColumnSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.column.delete({
        where: { id: input.columnId },
      });
    }),
});
