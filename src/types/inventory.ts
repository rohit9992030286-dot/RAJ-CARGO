
import { z } from 'zod';

export const inventoryItemSchema = z.object({
  waybillNumber: z.string(),
  partnerCode: z.string(),
  isUsed: z.boolean().default(false),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;
