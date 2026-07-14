import { Hammer } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { EmptyState } from '@/shared/components/EmptyState';
import { NAV_ITEMS } from '@/layouts/nav';

/**
 * Stands in for the CRUD features that land in the next phase.
 *
 * It exists because the empty dashboard is the first screen a new account sees,
 * and its calls to action have to go somewhere. A live route that says "not yet"
 * is honest; a disabled button is a dead end.
 */
export default function UpcomingPage() {
  const { pathname } = useLocation();
  const item = NAV_ITEMS.find((navItem) => pathname.startsWith(navItem.to) && navItem.to !== '/');

  return (
    <div className="grid h-full place-items-center p-6">
      <EmptyState
        icon={Hammer}
        title={`${item?.label ?? 'This section'} is not built yet`}
        description="Authentication and the dashboard came first. This screen is next: it will let you create, edit, and delete records."
      />
    </div>
  );
}
