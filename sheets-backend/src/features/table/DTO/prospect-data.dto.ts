// src/features/table/DTO/webhook-prospect-data.dto.ts
import { z } from 'zod';

export const WebhookProspectDataSchema = z.object({
  items: z.array(z.record(z.any())).min(1, 'Items array cannot be empty'),
  meta: z.object({
    tableId: z.string().min(1, 'Table ID is required'),
    baseId: z.string().min(1, 'Base ID is required'),
    viewId: z.string().min(1, 'View ID is required'),
    fields: z.array(z.record(z.any())),
  }),
});

export type WebhookProspectDataDTO = z.infer<typeof WebhookProspectDataSchema>;

// DTO for individual prospect item transformation
export const ProspectItemSchema = z.record(z.any());

export type ProspectItemDTO = z.infer<typeof ProspectItemSchema>;
