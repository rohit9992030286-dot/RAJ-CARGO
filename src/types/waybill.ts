import { z } from 'zod';

// Base object with all fields for a waybill, without the 'id' or complex validation.
const waybillFields = {
  waybillNumber: z.string().min(1, 'Waybill number is required.'),
  invoiceNumber: z.string({ required_error: "Invoice number is required."}).min(1, { message: 'Invoice number is required.' }),
  eWayBillNo: z.string().optional(),
  
  senderName: z.string({ required_error: "Sender name is required."}).min(2, { message: 'Sender name must be at least 2 characters.' }),
  senderAddress: z.union([z.string().min(10, { message: 'Please enter a valid sender address.' }), z.literal('')]),
  senderCity: z.union([z.string().min(2, { message: 'Sender city must be at least 2 characters.' }), z.literal('')]),
  senderPincode: z.string({ required_error: "Pincode is required."}).min(5, {message: 'Pincode must be at least 5 digits.'}),
  senderPhone: z.string({ required_error: "Sender phone is required."}).min(10, { message: 'Please enter a valid sender phone number.' }),
  
  receiverName: z.string({ required_error: "Receiver name is required."}).min(2, { message: 'Receiver name must be at least 2 characters.' }),
  receiverAddress: z.union([z.string().min(10, { message: 'Please enter a valid receiver address.' }), z.literal('')]),
  receiverCity: z.union([z.string().min(2, { message: 'Receiver city must be at least 2 characters.' }), z.literal('')]),
  receiverPincode: z.string({ required_error: "Pincode is required."}).min(5, {message: 'Pincode must be at least 5 digits.'}),
  receiverPhone: z.string({ required_error: "Receiver phone is required."}).min(10, { message: 'Please enter a valid receiver phone number.' }),

  packageDescription: z.string({ required_error: "Package description is required."}).min(3, { message: 'Description must be at least 3 characters.' }),
  packageWeight: z.coerce.number({ required_error: "Weight is required."}).positive({ message: 'Weight must be a positive number.' }),
  numberOfBoxes: z.coerce.number({ required_error: "Number of boxes is required."}).int().min(1, {message: 'Must have at least one box.'}),
  shipmentValue: z.coerce.number({ required_error: "Shipment value is required."}).nonnegative({ message: 'Value must be a positive number.' }),

  shippingDate: z.string().min(1, 'Shipping date is required').default(() => new Date().toISOString().split('T')[0]),
  shippingTime: z.string().min(1, 'Shipping time is required').default('10:00'),
  
  status: z.enum(['Pending', 'In Transit', 'Delivered', 'Cancelled']).default('Pending'),
};

// 1. Schema for the form validation. It includes the refinement for E-Way Bill.
// This is what the form should use. It does NOT have an `id`.
export const waybillFormSchema = z.object(waybillFields)
  .superRefine((data, ctx) => {
    if (data.shipmentValue >= 50000) {
        if (!data.eWayBillNo || data.eWayBillNo.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['eWayBillNo'],
                message: 'E-Way Bill number is required for shipment value of ₹50,000 or more.',
            });
        }
    }
  });


// 2. Schema for the data model. It includes the `id` field and is what's stored.
// It is built from the base fields to avoid re-applying refinement.
export const waybillSchema = z.object({
  ...waybillFields,
  id: z.string().uuid(),
});

// 3. The final Waybill type, derived from the full data model schema.
export type Waybill = z.infer<typeof waybillSchema>;
