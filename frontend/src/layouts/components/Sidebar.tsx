import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { NAV_ITEMS } from '../nav';

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="grid gap-0.5" aria-label="Main">
      {NAV_ITEMS.map(({ to, label, icon: Icon, upcoming }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors duration-150',
              'hover:bg-accent hover:text-accent-foreground',
              isActive
                ? 'bg-accent font-medium text-accent-foreground'
                : 'text-muted-foreground',
            )
          }
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{label}</span>
          {upcoming ? (
            <span className="ml-auto text-[0.625rem] uppercase tracking-wider text-muted-foreground/70">
              Soon
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-rule bg-panel md:flex">
      <div className="flex h-14 items-center border-b border-rule px-4">
        <Wordmark />
      </div>
      <div className="p-3">
        <SidebarNav />
      </div>
    </aside>
  );
}

export function Wordmark() {
  return (
    <span className="text-sm font-semibold tracking-tight text-panel-foreground">
      Inventory
      <span className="numeric ml-1.5 text-xs font-normal text-muted-foreground">/ IMS</span>
    </span>
  );
}
