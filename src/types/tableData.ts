import { z } from "zod";


export const getTableDataInputSchema = z.object({
    tableId: z.string().cuid(),
    viewId:  z.string().cuid().optional(),
    search:  z.string().optional(),
});

export type GetTableDataInput = z.infer<typeof getTableDataInputSchema>;


export const columnSchema = z.object({
    id:     z.string().cuid(),
    name:   z.string(),
    type:   z.string(),
    order:  z.number().int(),
    config: z.string().nullable(),
});

export type Column = z.infer<typeof columnSchema>;


export const cellSchema = z.object({
    columnId: z.string().cuid(),
    value:    z.string().nullable(),
});

export type Cell = z.infer<typeof cellSchema>;


export const rowSchema = z.object({
    id:    z.string().cuid(),
    order: z.number().int(),
    cells: z.array(cellSchema),
});

export type Row = z.infer<typeof rowSchema>;


export const viewGroupRefSchema = z.object({
    columnId:  z.string(),
    direction: z.string(),
    order:     z.number().int(),
});

export const viewFilterRefSchema = z.object({
    id:       z.string().cuid(),
    columnId: z.string().cuid(),
    operator: z.string(),
    value:    z.string().nullable(),
    order:    z.number().int(),
});

export const getTableDataOutputSchema = z.object({
    columns:         z.array(columnSchema),
    rows:            z.array(rowSchema),
    groups:          z.array(viewGroupRefSchema),
    hiddenColumnIds: z.array(z.string().cuid()),
    filters:         z.array(viewFilterRefSchema),
});

export type ViewFilterRef = z.infer<typeof viewFilterRefSchema>;

export type GetTableDataOutput = z.infer<typeof getTableDataOutputSchema>;
