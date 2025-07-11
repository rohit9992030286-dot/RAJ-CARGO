import { z } from 'zod';

const generateWaybillNumber = () => {
    const timestamp = Date.now().toString();
    const randomPart = Math.random().toString().substring(2, 6);
    return `SW-${timestamp.slice(-6)}-${randomPart}`;
};


const generateId = () => {
    if (typeof window !== 'undefined' && window.crypto) {
        return window.crypto.randomUUID();
    }
    // Fallback for non-browser environments (e.g., during SSR pre-hydration)
    return `uuid-${Date.now()}-${Math.random()}`;
};


export const waybillSchema = z.object({
  id: z.string().default(generateId),
  waybillNumber: z.string().min(1, 'Waybill number is required').default(generateWaybillNumber),
  invoiceNumber: z.string().min(1, { message: 'Invoice number is required.' }),
  
  senderName: z.string().min(2, { message: 'Sender name must be at least 2 characters.' }),
  senderAddress: z.string().min(10, { message: 'Please enter a valid sender address.' }),
  senderPincode: z.string().min(5, {message: 'Pincode must be at least 5 digits.'}),
  senderPhone: z.string().min(10, { message: 'Please enter a valid sender phone number.' }),
  
  receiverName: z.string().min(2, { message: 'Receiver name must be at least 2 characters.' }),
  receiverAddress: z.string().min(10, { message: 'Please enter a valid receiver address.' }),
  receiverPincode: z.string().min(5, {message: 'Pincode must be at least 5 digits.'}),
  receiverPhone: z.string().min(10, { message: 'Please enter a valid receiver phone number.' }),

  packageDescription: z.string().min(3, { message: 'Description must be at least 3 characters.' }),
  packageWeight: z.coerce.number().positive({ message: 'Weight must be a positive number.' }),
  numberOfBoxes: z.coerce.number().int().min(1, {message: 'Must have at least one box.'}),
  shipmentValue: z.coerce.number().positive({ message: 'Value must be a positive number.' }),

  shippingDate: z.string().min(1, 'Shipping date is required').default(() => new Date().toISOString().split('T')[0]),
  shippingTime: z.string().min(1, 'Shipping time is required').default('10:00'),
  
  status: z.enum(['Pending', 'In Transit', 'Delivered', 'Cancelled']).default('Pending'),
});

export type Waybill = z.infer<typeof waybillSchema>;
