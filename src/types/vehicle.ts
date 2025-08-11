
import { z } from 'zod';

export const vehicleSchema = z.object({
  id: z.string().uuid(),
  vehicleNumber: z.string().min(1, "Vehicle number is required."),
  driverName: z.string().min(2, "Driver name is required."),
  route: z.string().min(2, "Route is required."),
  routePrice: z.coerce.number().min(0, "Route price must be a positive number."),
  vehicleType: z.enum(['Personal', 'Market']).default('Market'),
});

export type Vehicle = z.infer<typeof vehicleSchema>;
export type VehicleFormData = Omit<Vehicle, 'id'>;
