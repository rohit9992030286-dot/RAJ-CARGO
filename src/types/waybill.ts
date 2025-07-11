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
  invoiceNumber: z.string({ required_error: "Invoice number is required."}).min(1, { message: 'Invoice number is required.' }),
  
  senderName: z.string({ required_error: "Sender name is required."}).min(2, { message: 'Sender name must be at least 2 characters.' }),
  senderAddress: z.string({ required_error: "Sender address is required."}).min(10, { message: 'Please enter a valid sender address.' }),
  senderPincode: z.string({ required_error: "Pincode is required."}).min(5, {message: 'Pincode must be at least 5 digits.'}),
  senderPhone: z.string({ required_error: "Sender phone is required."}).min(10, { message: 'Please enter a valid sender phone number.' }),
  
  receiverName: z.string({ required_error: "Receiver name is required."}).min(2, { message: 'Receiver name must be at least 2 characters.' }),
  receiverAddress: z.string({ required_error: "Receiver address is required."}).min(10, { message: 'Please enter a valid receiver address.' }),
  receiverPincode: z.string({ required_error: "Pincode is required."}).min(5, {message: 'Pincode must be at least 5 digits.'}),
  receiverPhone: z.string({ required_error: "Receiver phone is required."}).min(10, { message: 'Please enter a valid receiver phone number.' }),

  packageDescription: z.string({ required_error: "Package description is required."}).min(3, { message: 'Description must be at least 3 characters.' }),
  packageWeight: z.coerce.number({ required_error: "Weight is required."}).positive({ message: 'Weight must be a positive number.' }),
  numberOfBoxes: z.coerce.number({ required_error: "Number of boxes is required."}).int().min(1, {message: 'Must have at least one box.'}),
  shipmentValue: z.coerce.number({ required_error: "Shipment value is required."}).positive({ message: 'Value must be a positive number.' }),

  shippingDate: z.string().min(1, 'Shipping date is required').default(() => new Date().toISOString().split('T')[0]),
  shippingTime: z.string().min(1, 'Shipping time is required').default('10:00'),
  
  status: z.enum(['Pending', 'In Transit', 'Delivered', 'Cancelled']).default('Pending'),
}).superRefine((val, ctx) => {
    // This is a dummy superRefine to allow waybillSchema.parse({}) to work
    // by ensuring Zod runs the defaults. It doesn't add any validation logic.
});

export type Waybill = z.infer<typeof waybillSchema>;
