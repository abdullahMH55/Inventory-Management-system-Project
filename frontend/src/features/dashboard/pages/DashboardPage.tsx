import { useSession } from '@/features/auth/hooks/useSession';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Button } from '@/shared/components/ui/button';

/** Placeholder: the app shell and the real dashboard land in the next commits. */
export default function DashboardPage() {
  const { user } = useSession();
  const logout = useLogout();

  return (
    <div className="grid min-h-dvh place-items-center gap-4 p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Signed in</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {user?.name} · {user?.email}
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
