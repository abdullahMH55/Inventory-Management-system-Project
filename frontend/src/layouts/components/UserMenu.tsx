import { LogOut } from 'lucide-react';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useSession } from '@/features/auth/hooks/useSession';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { initialsOf } from '@/shared/lib/format';

export function UserMenu() {
  const { user } = useSession();
  const logout = useLogout();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground transition-opacity duration-150 hover:opacity-90"
        aria-label={`Account menu for ${user.name}`}
      >
        {initialsOf(user.name)}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="gap-2"
        >
          <LogOut className="size-4" aria-hidden />
          {logout.isPending ? 'Signing out' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
