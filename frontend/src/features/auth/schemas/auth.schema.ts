import { z } from 'zod';

/** Mirrors AuthResponse. Not .email(): never re-validate a response you did not author. */
export const authResponseSchema = z.object({
  userId: z.number().int(),
  name: z.string(),
  email: z.string(),
});

export type AuthUser = z.infer<typeof authResponseSchema>;

/**
 * No min(6) here even though register enforces it. A length rule on login leaks
 * the password policy and would lock out any account created under a different one.
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Mirrors RegisterRequest: Name <=100, Email <=255, Password 6..100. */
export const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email').max(255),
    password: z
      .string()
      .min(6, 'Use at least 6 characters')
      .max(100, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/** confirmPassword is client-only; the API has no such field. */
export type RegisterBody = Omit<RegisterInput, 'confirmPassword'>;
