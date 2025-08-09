
import { z } from 'zod';

export const companySchema = z.object({
  id: z.string().uuid(),
  companyCode: z.string().min(2, 'Company code is required.'),
  companyName: z.string().min(2, 'Company name is required.'),
  senderName: z.string().min(2, 'Sender name is required.'),
  senderAddress: z.string().min(10, 'Please enter a valid sender address.'),
  senderCity: z.string().min(2, 'Sender city is required.'),
  senderPincode: z.string().min(5, 'Pincode must be at least 5 digits.'),
  senderPhone: z.string().min(10, 'Please enter a valid sender phone number.'),
});

export type Company = z.infer<typeof companySchema>;
export type CompanyFormData = Omit<Company, 'id'>;
