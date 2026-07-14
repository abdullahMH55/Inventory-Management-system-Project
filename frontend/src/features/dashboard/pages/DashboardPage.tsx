import { useSession } from '@/features/auth/hooks/useSession';

/** Placeholder: the real dashboard lands in the next commits. */
export default function DashboardPage() {
  const { user } = useSession();

  return (
    <div className="p-6">
      <p className="text-sm text-muted-foreground">Signed in as {user?.email}</p>
    </div>
  );
}
