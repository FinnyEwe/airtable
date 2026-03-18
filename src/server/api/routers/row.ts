import { z } from "zod";
import { faker } from "@faker-js/faker";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const createRowSchema = z.object({
  tableId: z.string().cuid(),
});

const deleteRowSchema = z.object({
  rowId: z.string().cuid(),
});

const bulkInsertSchema = z.object({
  tableId: z.string().cuid(),
  count: z.number().int().min(1).max(10000),
});

const clearAllSchema = z.object({
  tableId: z.string().cuid(),
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
  bulkInsert: protectedProcedure
    .input(bulkInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
        orderBy: { order: "asc" },
      });

      const lastRow = await ctx.db.row.findFirst({
        where: { tableId: input.tableId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const startOrder = (lastRow?.order ?? -1) + 1;

      const generateValueForType = (type: string): string => {
        switch (type) {
          case "text":
            return faker.lorem.words(3);
          case "number":
            return faker.number.int({ min: 1, max: 1000 }).toString();
          case "email":
            return faker.internet.email();
          case "url":
            return faker.internet.url();
          case "phone":
            return faker.phone.number();
          case "date":
            return faker.date.past().toISOString();
          case "checkbox":
            return faker.datatype.boolean().toString();
          case "select":
            return faker.helpers.arrayElement(["Option 1", "Option 2", "Option 3"]);
          case "multiselect":
            return JSON.stringify(
              faker.helpers.arrayElements(["Tag A", "Tag B", "Tag C"], { min: 1, max: 2 })
            );
          default:
            return faker.lorem.sentence();
        }
      };

      const batchSize = 500;
      let totalInserted = 0;

      for (let batch = 0; batch < Math.ceil(input.count / batchSize); batch++) {
        const rowsInBatch = Math.min(batchSize, input.count - totalInserted);
        const rowsData = Array.from({ length: rowsInBatch }, (_, i) => ({
          order: startOrder + totalInserted + i,
          tableId: input.tableId,
        }));

        const createdRows = await ctx.db.row.createManyAndReturn({
          data: rowsData,
        });

        const cellsData = createdRows.flatMap((row) =>
          columns.map((col) => ({
            rowId: row.id,
            columnId: col.id,
            value: generateValueForType(col.type),
          }))
        );

        if (cellsData.length > 0) {
          await ctx.db.cell.createMany({
            data: cellsData,
          });
        }

        totalInserted += rowsInBatch;
      }

      return { inserted: totalInserted };
    }),
  clearAll: protectedProcedure
    .input(clearAllSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.row.deleteMany({
        where: { tableId: input.tableId },
      });

      return { deleted: result.count };
    }),
});
