import {
  Boxes,
  LayoutDashboard,
  Package,
  ReceiptText,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/app/routes';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Routed but not yet built. The link still works and lands on a placeholder. */
  upcoming?: boolean;
};

/**
 * The full destination list ships now, including the routes this phase does not
 * implement. A visible, working link to a "coming soon" page beats a dead button,
 * and it means the empty-state CTAs have somewhere real to go.
 */
export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.products, label: 'Products', icon: Package, upcoming: true },
  { to: ROUTES.categories, label: 'Categories', icon: Boxes },
  { to: ROUTES.sales, label: 'Sales', icon: ReceiptText, upcoming: true },
  { to: ROUTES.purchases, label: 'Purchases', icon: Truck, upcoming: true },
];
