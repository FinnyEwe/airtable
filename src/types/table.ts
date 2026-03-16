import { z } from "zod";

export const getTablesByBaseIdSchema = z.object({
    baseId: z.string().cuid(),
});

export const createTableSchema = z.object({
    name:        z.string(),
    baseId:      z.string().cuid(),
    createdById: z.string(),
});

export const tableSchema = z.object({
    id:          z.string().cuid(),
    name:        z.string(),
    order:       z.number().int(),
    baseId:      z.string().cuid(),
    createdById: z.string(),
    createdAt:   z.date(),
    updatedAt:   z.date(),
});

export const getTablesByBaseIdOutputSchema = z.array(tableSchema);

export type GetTablesByBaseIdInput  = z.infer<typeof getTablesByBaseIdSchema>;
export type CreateTableInput        = z.infer<typeof createTableSchema>;
export type Table                   = z.infer<typeof tableSchema>;
export type GetTablesByBaseIdOutput = z.infer<typeof getTablesByBaseIdOutputSchema>;
