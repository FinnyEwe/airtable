import { z } from "zod";
import { faker } from "@faker-js/faker";
import { randomBytes } from "crypto";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { Prisma } from "../../../../generated/prisma";

const PAGE_SIZE = 5000;

// ─── Schemas ──────────────────────────────────────────────────────────────────

const listRecordsSchema = z.object({
  tableId: z.string().cuid(),
  cursor: z.number().int().nullable().optional(),
  filters: z.array(z.object({
    columnId: z.string(),
    operator: z.string(),
    value: z.string().nullable(),
  })).optional(),
  sorts: z.array(z.object({
    columnId: z.string(),
    direction: z.enum(["asc", "desc"]),
  })).optional(),
  search: z.string().optional(),
});

const createRecordSchema = z.object({
  tableId: z.string().cuid(),
});

const updateCellSchema = z.object({
  rowId: z.string().cuid(),
  columnId: z.string().cuid(),
  value: z.string().nullable(),
});

const deleteRecordSchema = z.object({
  rowId: z.string().cuid(),
});

const bulkCreateSchema = z.object({
  tableId: z.string().cuid(),
  count: z.number().int().min(1).max(100000),
});

const clearDataSchema = z.object({
  tableId: z.string().cuid(),
});

const countSchema = z.object({
  tableId: z.string().cuid(),
  filters: z.array(z.object({
    columnId: z.string(),
    operator: z.string(),
    value: z.string().nullable(),
  })).optional(),
  search: z.string().optional(),
});

// ─── SQL Builders ─────────────────────────────────────────────────────────────

interface FilterInput {
  columnId?: string;
  operator?: string;
  value?: string | null;
}

interface SortInput {
  columnId?: string;
  direction?: "asc" | "desc";
}

function buildFilterConditions(
  filters: FilterInput[],
  search?: string,
): string[] {
  const conditions: string[] = [];

  for (const filter of filters) {
    if (!filter.columnId || !filter.operator) continue;
    
    const { columnId, operator, value } = filter;
    const jsonPath = `jsonb_extract_path_text(data, '${columnId}')`;

    switch (operator) {
      case "contains":
        if (value) {
          conditions.push(`${jsonPath} ILIKE '%${value}%'`);
        }
        break;
      case "not_contains":
        if (value) {
          conditions.push(`(${jsonPath} IS NULL OR ${jsonPath} NOT ILIKE '%${value}%')`);
        }
        break;
      case "equals":
        conditions.push(`${jsonPath} = '${value}'`);
        break;
      case "not_equals":
        conditions.push(`(${jsonPath} IS NULL OR ${jsonPath} != '${value}')`);
        break;
      case "is_empty":
        conditions.push(`(${jsonPath} IS NULL OR ${jsonPath} = '')`);
        break;
      case "is_not_empty":
        conditions.push(`${jsonPath} IS NOT NULL AND ${jsonPath} != ''`);
        break;
      case "gt":
        if (value) {
          conditions.push(`(${jsonPath})::numeric > ${parseFloat(value)}`);
        }
        break;
      case "lt":
        if (value) {
          conditions.push(`(${jsonPath})::numeric < ${parseFloat(value)}`);
        }
        break;
    }
  }

  if (search) {
    conditions.push(`EXISTS (
      SELECT 1 FROM jsonb_each_text(data) AS kv
      WHERE kv.value ILIKE '%${search}%'
    )`);
  }

  return conditions;
}

function buildOrderSQL(
  sorts: SortInput[],
): string {
  if (sorts.length === 0) {
    return '"order" ASC';
  }

  const orderParts: string[] = [];
  for (const sort of sorts) {
    if (!sort.columnId || !sort.direction) continue;
    
    const dir = sort.direction === "desc" ? "DESC" : "ASC";
    // Try to cast as numeric for proper sorting, fall back to text
    orderParts.push(
      `COALESCE(
        CASE WHEN jsonb_extract_path_text(data, '${sort.columnId}') ~ '^-?[0-9]+\\.?[0-9]*$'
          THEN (jsonb_extract_path_text(data, '${sort.columnId}'))::numeric
        END,
        0
      ) ${dir} NULLS LAST`
    );
    orderParts.push(`jsonb_extract_path_text(data, '${sort.columnId}') ${dir} NULLS LAST`);
  }
  orderParts.push('"order" ASC');

  return orderParts.join(', ');
}

function buildWhereClause(
  tableId: string,
  cursor: number | null | undefined,
  filterConditions: string[],
): string {
  const parts: string[] = [`"tableId" = '${tableId}'`];

  if (cursor !== null && cursor !== undefined) {
    parts.push(`"order" > ${cursor}`);
  }

  parts.push(...filterConditions);

  return parts.join(' AND ');
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const recordRouter = createTRPCRouter({
  /**
   * List records with keyset pagination
   * Returns { records, nextCursor, total }
   * total is only computed on the first page (cursor === null)
   */
  list: publicProcedure
    .input(listRecordsSchema)
    .query(async ({ ctx, input }) => {
      const filterConditions = buildFilterConditions(
        input.filters ?? [],
        input.search,
      );
      const whereClause = buildWhereClause(
        input.tableId,
        input.cursor,
        filterConditions,
      );
      const orderSQL = buildOrderSQL(input.sorts ?? []);

      // Only compute COUNT on first page
      let total: number | undefined;
      if (input.cursor === null || input.cursor === undefined) {
        const countResult = await ctx.db.$queryRawUnsafe<[{ count: bigint }]>(
          `SELECT COUNT(*)::bigint as count FROM "Row" WHERE ${whereClause}`
        );
        total = Number(countResult[0]?.count ?? 0);
      }

      // Keyset pagination query
      const records = await ctx.db.$queryRawUnsafe<
        Array<{ id: string; order: number; data: Record<string, unknown> | null }>
      >(
        `SELECT id, "order", data FROM "Row" WHERE ${whereClause} ORDER BY ${orderSQL} LIMIT ${PAGE_SIZE}`
      );

      const nextCursor = records.length === PAGE_SIZE
        ? records[records.length - 1]?.order
        : undefined;

      return {
        records: records.map(r => ({
          id: r.id,
          order: r.order,
          data: r.data ?? {},
        })),
        nextCursor,
        total,
      };
    }),

  /**
   * Fast count for toolbar display
   */
  count: publicProcedure
    .input(countSchema)
    .query(async ({ ctx, input }) => {
      const filterConditions = buildFilterConditions(
        input.filters ?? [],
        input.search,
      );
      const whereClause = buildWhereClause(
        input.tableId,
        null,
        filterConditions,
      );

      const result = await ctx.db.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*)::bigint as count FROM "Row" WHERE ${whereClause}`
      );

      return { count: Number(result[0]?.count ?? 0) };
    }),

  /**
   * Create a single record
   */
  create: protectedProcedure
    .input(createRecordSchema)
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
          data: {},
        },
      });
    }),

  /**
   * Update a single cell in the JSONB data blob
   */
  updateCell: protectedProcedure
    .input(updateCellSchema)
    .mutation(async ({ ctx, input }) => {
      // Handle null values by removing the key from JSONB
      if (input.value === null) {
        return ctx.db.$executeRaw`
          UPDATE "Row"
          SET data = COALESCE(data, '{}'::jsonb) - ${input.columnId}
          WHERE id = ${input.rowId}
        `;
      }
      
      // Merge the value into the JSONB data
      // Cast value to text explicitly to help Postgres determine type
      return ctx.db.$executeRaw`
        UPDATE "Row"
        SET data = COALESCE(data, '{}'::jsonb) || jsonb_build_object(${input.columnId}, ${input.value}::text)
        WHERE id = ${input.rowId}
      `;
    }),

  /**
   * Delete a single record
   */
  delete: protectedProcedure
    .input(deleteRecordSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.row.delete({
        where: { id: input.rowId },
      });
    }),

  /**
   * Bulk create with 4-layer optimization:
   * 1. Parallel prefetch (table, fields, last order)
   * 2. Value pools (pre-generate 500 values per field type)
   * 3. GIN index drop (temporarily remove index during bulk insert)
   * 4. Parallel batch inserts (10k rows per batch, all batches in parallel)
   */
  bulkCreate: protectedProcedure
    .input(bulkCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const BATCH_SIZE = 10000;
      const POOL_SIZE = 500;

      // ─── Optimization 1: Parallel Prefetch ─────────────────────────────────
      const [table, fields, lastRow] = await Promise.all([
        ctx.db.table.findUniqueOrThrow({
          where: { id: input.tableId },
        }),
        ctx.db.column.findMany({
          where: { tableId: input.tableId },
          orderBy: { order: "asc" },
        }),
        ctx.db.row.findFirst({
          where: { tableId: input.tableId },
          orderBy: { order: "desc" },
          select: { order: true },
        }),
      ]);

      const startOrder = (lastRow?.order ?? -1) + 1;

      // ─── Optimization 2: Value Pools ───────────────────────────────────────
      const valuePools = new Map<string, string[]>();
      
      for (const field of fields) {
        const pool: string[] = [];
        for (let i = 0; i < POOL_SIZE; i++) {
          switch (field.type) {
            case "text":
              pool.push(faker.lorem.words(3));
              break;
            case "number":
              pool.push(faker.number.int({ min: 1, max: 1000 }).toString());
              break;
            case "email":
              pool.push(faker.internet.email());
              break;
            case "url":
              pool.push(faker.internet.url());
              break;
            case "phone":
              pool.push(faker.phone.number());
              break;
            case "date":
              pool.push(faker.date.past().toISOString());
              break;
            case "checkbox":
              pool.push(faker.datatype.boolean().toString());
              break;
            case "select":
              pool.push(faker.helpers.arrayElement(["Option 1", "Option 2", "Option 3"]));
              break;
            case "multiselect":
              pool.push(
                JSON.stringify(
                  faker.helpers.arrayElements(["Tag A", "Tag B", "Tag C"], { min: 1, max: 2 })
                )
              );
              break;
            default:
              pool.push(faker.lorem.sentence());
          }
        }
        valuePools.set(field.id, pool);
      }

      // ─── Optimization 3: GIN Index Drop ────────────────────────────────────
      try {
        await ctx.db.$executeRawUnsafe(`DROP INDEX IF EXISTS "Row_data_idx"`);
      } catch (e) {
        // Non-fatal if index doesn't exist
        console.warn("Could not drop GIN index:", e);
      }

      try {
        // ─── Optimization 4: Parallel Batch Inserts ─────────────────────────
        const numBatches = Math.ceil(input.count / BATCH_SIZE);
        const batchPromises: Promise<unknown>[] = [];

        for (let batchIdx = 0; batchIdx < numBatches; batchIdx++) {
          const batchStart = batchIdx * BATCH_SIZE;
          const batchEnd = Math.min(batchStart + BATCH_SIZE, input.count);
          const batchSize = batchEnd - batchStart;

          // Generate rows for this batch
          const rows: Array<{ id: string; order: number; tableId: string; data: Record<string, string> }> = [];
          
          for (let i = 0; i < batchSize; i++) {
            const rowData: Record<string, string> = {};
            for (const field of fields) {
              const pool = valuePools.get(field.id)!;
              rowData[field.id] = pool[Math.floor(Math.random() * POOL_SIZE)]!;
            }

            rows.push({
              id: `rec_${randomBytes(12).toString('hex')}`,
              order: startOrder + batchStart + i,
              tableId: input.tableId,
              data: rowData,
            });
          }

          // Insert this batch in parallel
          const insertPromise = ctx.db.$executeRawUnsafe(
            `
            INSERT INTO "Row" (id, "order", "tableId", data, "createdAt", "updatedAt")
            SELECT 
              (r->>'id')::text,
              (r->>'order')::integer,
              (r->>'tableId')::text,
              (r->>'data')::jsonb,
              NOW(),
              NOW()
            FROM json_array_elements($1::json) AS r
            `,
            JSON.stringify(rows)
          );

          batchPromises.push(insertPromise);
        }

        // Wait for all batches to complete
        await Promise.all(batchPromises);

      } finally {
        // ─── Recreate GIN Index ─────────────────────────────────────────────
        try {
          await ctx.db.$executeRawUnsafe(
            `CREATE INDEX "Row_data_idx" ON "Row" USING GIN (data)`
          );
        } catch (e) {
          console.error("Failed to recreate GIN index:", e);
        }
      }

      return { inserted: input.count };
    }),

  /**
   * Clear all records for a table
   */
  clearData: protectedProcedure
    .input(clearDataSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.row.deleteMany({
        where: { tableId: input.tableId },
      });

      return { deleted: result.count };
    }),
});
