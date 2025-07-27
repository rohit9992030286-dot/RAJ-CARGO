import { z } from 'zod';

// Base schema for fields shared between the form and the data model
const baseWaybillSchema = z.object({
  waybillNumber: z.string().min(1, 'Waybill number is required.'),
  invoiceNumber: z.string().min(1, 'Invoice number is required.'),
  eWayBillNo: z.string().optional(),
  
  senderName: z.string().min(2, 'Sender name must be at least 2 characters.'),
  senderAddress: z.string().min(10, 'Please enter a valid sender address.'),
  senderCity: z.string().min(2, 'Sender city must be at least 2 characters.'),
  senderPincode: z.string().min(5, 'Pincode must be at least 5 digits.'),
  senderPhone: z.string().min(10, 'Please enter a valid sender phone number.'),
  
  receiverName: z.string().min(2, 'Receiver name must be at least 2 characters.'),
  receiverAddress: z.string().min(10, 'Please enter a valid receiver address.'),
  receiverCity: z.string().min(2, 'Receiver city must be at least 2 characters.'),
  receiverPincode: z.string().min(5, 'Pincode must be at least 5 digits.'),
  receiverPhone: z.string().min(10, 'Please enter a valid receiver phone number.'),

  packageDescription: z.string().min(3, 'Description must be at least 3 characters.'),
  packageWeight: z.coerce.number().positive('Weight must be a positive number.'),
  numberOfBoxes: z.coerce.number().int().min(1, 'Must have at least one box.'),
  shipmentValue: z.coerce.number().nonnegative('Value must be a positive number.'),

  shippingDate: z.string().min(1, 'Shipping date is required'),
  shippingTime: z.string().min(1, 'Shipping time is required'),
  
  status: z.enum(['Pending', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned']),
  partnerCode: z.string().optional(), // Added for multi-tenancy
});

// Schema for the form data, with the superRefine for conditional validation.
export const waybillFormSchema = baseWaybillSchema.superRefine((data, ctx) => {
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

// Full schema for the data model, including the 'id'. This extends the BASE schema.
export const waybillSchema = baseWaybillSchema.extend({
  id: z.string().uuid(),
});


export type WaybillFormData = z.infer<typeof waybillFormSchema>;
export type Waybill = z.infer<typeof waybillSchema>;
