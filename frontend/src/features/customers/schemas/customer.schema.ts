import { z } from 'zod';

/** Mirrors CustomerResponse. */
export const customerSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
});

export type Customer = z.infer<typeof customerSchema>;

/** Mirrors CreateCustomerRequest: Name required (<=255), the rest optional. */
export const customerFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255, 'Name is too long'),
  // Optional, but if present it must be a valid email (the server enforces this too).
  email: z
    .string()
    .trim()
    .max(255)
    .email('Enter a valid email')
    .or(z.literal(''))
    .optional(),
  phone: z.string().trim().max(50).optional(),
  address: z.string().trim().max(1000).optional(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export type CustomerCreate = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};
export type CustomerUpdate = CustomerCreate & { id: number };
