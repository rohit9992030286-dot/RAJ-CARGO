
import { z } from 'zod';

export const manifestSchema = z.object({
  id: z.string().uuid(),
  date: z.string().min(1, 'Manifest date is required.'),
  vehicleNo: z.string().optional(),
  waybillIds: z.array(z.string().uuid()),
  status: z.enum(['Draft', 'Dispatched', 'Received']).default('Draft'),
});

export type Manifest = z.infer<typeof manifestSchema>;
