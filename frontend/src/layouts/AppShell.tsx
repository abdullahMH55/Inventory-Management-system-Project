import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { NAV_ITEMS } from './nav';

/**
 * The geometry every feature inherits: 240px sidebar, 56px topbar. FullPageLoader
 * mirrors both, so the session-unknown loader resolves into this without reflow.
 */
export function AppShell() {
  const { pathname } = useLocation();
  const current = NAV_ITEMS.find((item) =>
    item.to === '/' ? pathname === '/' : pathname.startsWith(item.to),
  );

  return (
    <div className="flex h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={current?.label ?? 'Inventory'} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
