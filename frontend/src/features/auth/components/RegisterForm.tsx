import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { Field } from '@/shared/components/Field';
import { Button } from '@/shared/components/ui/button';
import { useRegister } from '../hooks/useRegister';
import { useServerFieldErrors } from '../hooks/useServerFieldErrors';
import { registerSchema, type RegisterInput } from '../schemas/auth.schema';

export function RegisterForm() {
  const register = useRegister();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  useServerFieldErrors(form, register.error ?? null);

  // 409 "Email already registered" is the one that matters here.
  const formError =
    register.error && register.error.kind !== 'validation' ? register.error.message : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Your inventory starts empty. You will add the first product in a minute.
      </p>

      {formError ? (
        <p
          className="mt-6 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          {formError}
        </p>
      ) : null}

      <form
        className="mt-6 grid gap-4"
        onSubmit={form.handleSubmit(({ confirmPassword: _confirm, ...body }) =>
          register.mutate(body),
        )}
        noValidate
      >
        <Field
          label="Name"
          autoComplete="name"
          placeholder="Amina Farouk"
          disabled={register.isPending}
          error={form.formState.errors.name?.message}
          {...form.register('name')}
        />

        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@shop.com"
          disabled={register.isPending}
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />

        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          disabled={register.isPending}
          error={form.formState.errors.password?.message}
          {...form.register('password')}
        />

        <Field
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          disabled={register.isPending}
          error={form.formState.errors.confirmPassword?.message}
          {...form.register('confirmPassword')}
        />

        <Button type="submit" className="mt-2 w-full" disabled={register.isPending}>
          {register.isPending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : null}
          {register.isPending ? 'Creating account' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
