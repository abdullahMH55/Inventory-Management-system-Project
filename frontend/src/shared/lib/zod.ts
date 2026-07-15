import type { AxiosResponse } from 'axios';
import type { z, ZodType } from 'zod';
import { AppError } from '@/shared/api/errors';

/**
 * Parse every response at the api/ boundary.
 *
 * Rule for the codebase: no hand-written response interfaces. Every type
 * downstream is z.infer<> of the schema that validated it, so the DTO has one
 * source of truth.
 */
export async function request<T extends ZodType>(
  schema: T,
  promise: Promise<AxiosResponse<unknown>>,
): Promise<z.infer<T>> {
  // Rejections were already normalized to AppError by the client interceptor.
  const response = await promise;

  const parsed = schema.safeParse(response.data);
  if (!parsed.success) {
    throw new AppError({
      kind: 'unknown',
      status: response.status,
      message: 'The server returned unexpected data.',
      raw: parsed.error.issues,
    });
  }

  return parsed.data;
}
