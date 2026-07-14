import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { Field } from '@/shared/components/Field';
import { FormError } from '@/shared/components/FormError';
import { Button } from '@/shared/components/ui/button';
import { useLogin } from '../hooks/useLogin';
import { useServerFieldErrors } from '../hooks/useServerFieldErrors';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';
import { useAuthStore } from '../stores/auth.store';

export function LoginForm() {
  const login = useLogin();
  const sessionExpired = useAuthStore((state) => state.sessionExpired);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useServerFieldErrors(form, login.error ?? null);

  // A wrong password (401) or a dead API is not a field error; it belongs above
  // the form. Validation errors are already sitting on the fields themselves.
  const formError =
    login.error && login.error.kind !== 'validation' ? login.error.message : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Pick up where your stock left off.
      </p>

      {sessionExpired && !formError ? (
        <p
          className="mt-6 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          Your session expired. Sign in again to continue.
        </p>
      ) : null}

      {formError ? <div className="mt-6">{<FormError message={formError} />}</div> : null}

      <form
        className="mt-6 grid gap-4"
        onSubmit={form.handleSubmit((values) => login.mutate(values))}
        noValidate
      >
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@shop.com"
          disabled={login.isPending}
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />

        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          disabled={login.isPending}
          error={form.formState.errors.password?.message}
          {...form.register('password')}
        />

        <Button type="submit" className="mt-2 w-full" disabled={login.isPending}>
          {login.isPending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : null}
          {login.isPending ? 'Signing in' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        No account yet?{' '}
        <Link to={ROUTES.register} className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
