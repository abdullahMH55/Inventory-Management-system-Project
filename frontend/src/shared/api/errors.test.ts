import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { AppError, normalizeError } from './errors';

function axiosErrorWith(status: number, data: unknown, url = '/Products/1'): AxiosError {
  const config = { url, headers: new AxiosHeaders() };
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, {}, response);
}

describe('normalizeError', () => {
  it('reads the { message } shape used by domain errors', () => {
    const error = normalizeError(axiosErrorWith(409, { message: 'Email already registered' }));

    expect(error.kind).toBe('domain');
    expect(error.status).toBe(409);
    expect(error.message).toBe('Email already registered');
  });

  it('maps a 401 to unauthorized while keeping the server message', () => {
    const error = normalizeError(axiosErrorWith(401, { message: 'Invalid email or password' }));

    expect(error.kind).toBe('unauthorized');
    expect(error.message).toBe('Invalid email or password');
  });

  it('camelCases the PascalCase keys of ValidationProblemDetails', () => {
    const error = normalizeError(
      axiosErrorWith(400, {
        type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
        title: 'One or more validation errors occurred.',
        status: 400,
        errors: {
          Email: ['The Email field is not a valid e-mail address.'],
          Password: ['The field Password must be a string with a minimum length of 6.'],
        },
      }),
    );

    expect(error.kind).toBe('validation');
    // camelCase so the keys line up with react-hook-form field names.
    expect(Object.keys(error.fieldErrors ?? {})).toEqual(['email', 'password']);
    expect(error.message).toBe('The Email field is not a valid e-mail address.');
  });

  it('strips the "$." prefix ModelState puts on JSON binding keys', () => {
    const error = normalizeError(
      axiosErrorWith(400, { errors: { '$.price': ['Could not convert to decimal.'] } }),
    );

    expect(Object.keys(error.fieldErrors ?? {})).toEqual(['price']);
  });

  it('reads the { statusCode, message } shape from ExceptionMiddleware', () => {
    const error = normalizeError(
      axiosErrorWith(500, { statusCode: 500, message: 'An internal server error occurred' }),
    );

    expect(error.kind).toBe('server');
    expect(error.message).toBe('An internal server error occurred');
  });

  it('recovers a bare string body, which PUT returns on an id mismatch', () => {
    const error = normalizeError(axiosErrorWith(400, 'Id mismatch'));

    expect(error.kind).toBe('domain');
    expect(error.message).toBe('Id mismatch');
  });

  it('rejects an HTML body rather than rendering markup as a message', () => {
    const error = normalizeError(axiosErrorWith(500, '<!DOCTYPE html><html>...'));

    expect(error.message).toBe('Something went wrong on the server.');
  });

  it('falls back to a generic message on a bodiless 404', () => {
    const error = normalizeError(axiosErrorWith(404, ''));

    expect(error.kind).toBe('notfound');
    expect(error.message).toBe('The requested item was not found.');
  });

  it('reports a missing response as a network error, not a server error', () => {
    const error = normalizeError(new AxiosError('Network Error', 'ERR_NETWORK'));

    expect(error.kind).toBe('network');
    expect(error.status).toBe(0);
    expect(error.message).toContain('Cannot reach the server');
  });

  it('treats a gateway status as unreachable, since a dead API behind a proxy is a 502', () => {
    for (const status of [502, 503, 504]) {
      const error = normalizeError(axiosErrorWith(status, ''));

      expect(error.kind).toBe('network');
      expect(error.message).toContain('Cannot reach the server');
    }
  });

  it('never leaks a gateway\'s own error text to the user', () => {
    const error = normalizeError(
      axiosErrorWith(502, 'Error: connect ECONNREFUSED 127.0.0.1:5166'),
    );

    expect(error.message).toContain('Cannot reach the server');
    expect(error.message).not.toContain('ECONNREFUSED');
  });

  it('passes an existing AppError through untouched', () => {
    const original = new AppError({ kind: 'domain', status: 400, message: 'Already normalized' });

    expect(normalizeError(original)).toBe(original);
  });
});
