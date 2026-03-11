import { z } from "zod";

export const createBaseSchema = z.object({
    name: z.string().min(1, "Base name is required"),
});

export const getBaseByIdSchema = z.object({
    id: z.string().cuid(),
});

export const baseSchema = z.object({
    id:          z.string().cuid(),
    name:        z.string(),
    createdById: z.string(),
    createdAt:   z.date(),
    updatedAt:   z.date(),
});

export const getBaseByIdOutputSchema = baseSchema;
export const getAllBasesOutputSchema  = z.array(baseSchema);

export type CreateBaseInput      = z.infer<typeof createBaseSchema>;
export type GetBaseByIdInput     = z.infer<typeof getBaseByIdSchema>;
export type Base                 = z.infer<typeof baseSchema>;
export type GetBaseByIdOutput    = z.infer<typeof getBaseByIdOutputSchema>;
export type GetAllBasesOutput    = z.infer<typeof getAllBasesOutputSchema>;
