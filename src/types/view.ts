import { z } from "zod";

export const getViewsByTableIdSchema = z.object({
    tableId: z.string().cuid(),
});

export const viewSchema = z.object({
    id:          z.string().cuid(),
    name:        z.string(),
    type:        z.string(),
    order:       z.number().int(),
    config:      z.string().nullable(),
    tableId:     z.string().cuid(),
    createdById: z.string(),
    createdAt:   z.date(),
    updatedAt:   z.date(),
});

export const getViewsByTableIdOutputSchema = z.array(viewSchema);

export type GetViewsByTableIdInput  = z.infer<typeof getViewsByTableIdSchema>;
export type View                    = z.infer<typeof viewSchema>;
export type GetViewsByTableIdOutput = z.infer<typeof getViewsByTableIdOutputSchema>;
