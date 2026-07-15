import {
  Boxes,
  Factory,
  LayoutDashboard,
  Package,
  ReceiptText,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/app/routes';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Routed but not yet built. The link still works and lands on a placeholder. */
  upcoming?: boolean;
  /** Starts a new visual group in the sidebar (a hairline divider above it). */
  groupStart?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.products, label: 'Products', icon: Package, upcoming: true },
  { to: ROUTES.categories, label: 'Categories', icon: Boxes },
  { to: ROUTES.sales, label: 'Sales', icon: ReceiptText, upcoming: true },
  { to: ROUTES.purchases, label: 'Purchases', icon: Truck, upcoming: true },
  // The directory: who you sell to and buy from.
  { to: ROUTES.customers, label: 'Customers', icon: Users, groupStart: true },
  { to: ROUTES.suppliers, label: 'Suppliers', icon: Factory },
];
