import { Outlet } from 'react-router-dom';

/**
 * A single centered form on the paper background. There is no illustration
 * panel, deliberately: the only thing worth showing next to a sign-in form is
 * the user's own inventory, and before they sign in there isn't one. Anything
 * else would be invented numbers dressed up as records.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
