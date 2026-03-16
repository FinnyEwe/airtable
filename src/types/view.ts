import { z } from "zod";

export const getViewsByTableIdSchema = z.object({
    tableId: z.string().cuid(),
});

export const getViewByIdSchema = z.object({
    viewId: z.string().cuid(),
});

export const createViewSchema = z.object({
    name: z.string(),
    type: z.string(),
    tableId: z.string().cuid(),
    createdById: z.string(),
});


export const viewFilterSchema = z.object({
    id:       z.string().cuid(),
    columnId: z.string().cuid(),
    operator: z.string(),
    value:    z.string().nullable(),
    order:    z.number().int(),
});

export const viewSortSchema = z.object({
    id:        z.string().cuid(),
    columnId:  z.string().cuid(),
    direction: z.string(),
    order:     z.number().int(),
});

export const viewGroupSchema = z.object({
    id:        z.string(),
    columnId:  z.string().cuid(),
    direction: z.string(),
    order:     z.number().int(),
});

export const updateViewGroupsSchema = z.object({
    viewId: z.string().cuid(),
    groups: z.array(z.object({
        columnId:  z.string().cuid(),
        direction: z.enum(["asc", "desc"]),
    })).optional(),
});

export const viewSchema = z.object({
    id:          z.string().cuid(),
    name:        z.string(),
    type:        z.string(),
    order:       z.number().int(),
    config:      z.string().nullable(),
    searchQuery: z.string().nullable(),
    tableId:     z.string().cuid(),
    createdById: z.string(),
    createdAt:   z.date(),
    updatedAt:   z.date(),
});

export const viewWithConfigSchema = viewSchema.extend({
    filters: z.array(viewFilterSchema),
    sorts:   z.array(viewSortSchema),
    groups:  z.array(viewGroupSchema),
});

export const getViewsByTableIdOutputSchema = z.array(viewSchema);

export type GetViewsByTableIdInput  = z.infer<typeof getViewsByTableIdSchema>;
export type GetViewByIdInput        = z.infer<typeof getViewByIdSchema>;
export type ViewFilter              = z.infer<typeof viewFilterSchema>;
export type ViewSort                = z.infer<typeof viewSortSchema>;
export type ViewGroup               = z.infer<typeof viewGroupSchema>;
export type UpdateViewGroupsInput   = z.infer<typeof updateViewGroupsSchema>;
export type View                    = z.infer<typeof viewSchema>;
export type ViewWithConfig          = z.infer<typeof viewWithConfigSchema>;
export type GetViewsByTableIdOutput = z.infer<typeof getViewsByTableIdOutputSchema>;
