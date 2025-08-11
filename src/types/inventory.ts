
import { z } from 'zod';

export const inventoryItemSchema = z.object({
  waybillNumber: z.string(),
  partnerCode: z.string(),
  isUsed: z.boolean().default(false),
  companyCode: z.string().optional(), // Can be linked to a specific company
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;
