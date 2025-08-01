
import { z } from 'zod';

export const manifestSchema = z.object({
  id: z.string().uuid(),
  date: z.string().min(1, 'Manifest date is required.'),
  vehicleNo: z.string().min(1, 'Vehicle number is required.'),
  driverName: z.string().optional(),
  driverContact: z.string().optional(),
  waybillIds: z.array(z.string().uuid()),
  status: z.enum(['Draft', 'Dispatched', 'Received', 'Short Received']).default('Draft'),
  origin: z.enum(['booking']).default('booking'),
  deliveryPartnerCode: z.string().optional(),
  creatorPartnerCode: z.string(),
  verifiedBoxIds: z.array(z.string()).optional(),
});

export type Manifest = z.infer<typeof manifestSchema>;
