import axios, { type AxiosError } from 'axios';

/**
 * The API answers with three different error shapes plus two edge cases, so a
 * single schema cannot describe them:
 *
 *   1. { message }                     domain errors (401 bad creds, 409 email taken)
 *   2. ValidationProblemDetails        RFC7807, PascalCase keys under .errors
 *   3. { statusCode, message }         ExceptionMiddleware, always 500
 *   4. a bare string                   PUT id-mismatch returns "Id mismatch" as text
 *   5. no body at all                  404 / 204, and no response when the API is down
 *
 * Everything downstream sees an AppError instead.
 */

export type AppErrorKind =
  | 'validation'
  | 'domain'
  | 'unauthorized'
  | 'forbidden'
  | 'notfound'
  | 'server'
  | 'network'
  | 'unknown';

export type FieldErrors = Record<string, string[]>;

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly status: number;
  readonly fieldErrors?: FieldErrors;
  readonly raw?: unknown;

  constructor(args: {
    kind: AppErrorKind;
    status: number;
    message: string;
    fieldErrors?: FieldErrors;
    raw?: unknown;
  }) {
    super(args.message);
    this.name = 'AppError';
    this.kind = args.kind;
    this.status = args.status;
    this.fieldErrors = args.fieldErrors;
    this.raw = args.raw;
  }
}

/** "Email" -> "email", "$.price" -> "price". ModelState prefixes JSON-binding keys with "$.". */
function toCamel(key: string): string {
  const stripped = key.replace(/^\$\./, '');
  return stripped ? stripped[0].toLowerCase() + stripped.slice(1) : '_';
}

type ProblemDetails = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

function isProblemDetails(data: unknown): data is ProblemDetails {
  return !!data && typeof data === 'object' && ('errors' in data || 'title' in data);
}

function hasMessage(data: unknown): data is { message: string } {
  return (
    !!data && typeof data === 'object' && typeof (data as { message?: unknown }).message === 'string'
  );
}

const UNREACHABLE = 'Cannot reach the server. Check that the API is running.';

const GENERIC_MESSAGE: Record<number, string> = {
  400: 'The request was invalid.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have access to this resource.',
  404: 'The requested item was not found.',
  409: 'That conflicts with existing data.',
  500: 'Something went wrong on the server.',
  502: UNREACHABLE,
  503: UNREACHABLE,
  504: UNREACHABLE,
};

/**
 * A dead API does not always look like a network failure. Behind the dev proxy
 * (and behind any reverse proxy in production) it comes back as a 502, with a
 * response object and everything, so it must be classified as unreachable
 * rather than as the server having thrown.
 */
const GATEWAY_STATUSES = new Set([502, 503, 504]);

function kindForStatus(status: number): AppErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notfound';
  if (GATEWAY_STATUSES.has(status)) return 'network';
  if (status >= 500) return 'server';
  return 'domain';
}

export function normalizeError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (axios.isCancel(err)) {
    return new AppError({ kind: 'unknown', status: 0, message: 'Request cancelled' });
  }

  if (!axios.isAxiosError(err)) {
    return new AppError({
      kind: 'unknown',
      status: 0,
      message: err instanceof Error ? err.message : 'Unexpected error',
      raw: err,
    });
  }

  const axiosError = err as AxiosError<unknown>;

  // No response at all: API down, DNS, or a preflight the browser refused.
  if (!axiosError.response) {
    return new AppError({
      kind: 'network',
      status: 0,
      message: UNREACHABLE,
      raw: axiosError.message,
    });
  }

  const { status, data } = axiosError.response;

  // Short-circuit before the body is read: a gateway's body is its own error
  // text ("ECONNREFUSED..."), not the API's, and must never reach the user.
  if (GATEWAY_STATUSES.has(status)) {
    return new AppError({ kind: 'network', status, message: UNREACHABLE, raw: data });
  }

  // (2) ValidationProblemDetails. Keys arrive PascalCase; camelCase them so they
  //     line up with react-hook-form field names without a mapping table.
  if (isProblemDetails(data) && data.errors && Object.keys(data.errors).length > 0) {
    const fieldErrors: FieldErrors = {};
    for (const [key, messages] of Object.entries(data.errors)) {
      fieldErrors[toCamel(key)] = messages ?? [];
    }
    const firstMessage = Object.values(fieldErrors)[0]?.[0];
    return new AppError({
      kind: 'validation',
      status,
      message: firstMessage ?? data.title ?? GENERIC_MESSAGE[400],
      fieldErrors,
      raw: data,
    });
  }

  // (1) { message } and (3) { statusCode, message } read identically.
  if (hasMessage(data)) {
    return new AppError({ kind: kindForStatus(status), status, message: data.message, raw: data });
  }

  // (4) A bare string body.
  if (typeof data === 'string') {
    const text = data.trim();
    const usable = text.length > 0 && text.length <= 300 && !text.startsWith('<');
    return new AppError({
      kind: kindForStatus(status),
      status,
      message: usable ? text : (GENERIC_MESSAGE[status] ?? `Request failed (${status})`),
      raw: data,
    });
  }

  // ProblemDetails carrying a title/detail but no field errors.
  if (isProblemDetails(data) && (data.detail || data.title)) {
    return new AppError({
      kind: kindForStatus(status),
      status,
      message: data.detail ?? data.title!,
      raw: data,
    });
  }

  // (5) Bodiless.
  return new AppError({
    kind: kindForStatus(status),
    status,
    message: GENERIC_MESSAGE[status] ?? `Request failed (${status})`,
    raw: data,
  });
}
