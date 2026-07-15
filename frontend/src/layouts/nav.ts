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
  /** Starts a new visual group in the sidebar (a hairline divider above it). */
  groupStart?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.products, label: 'Products', icon: Package },
  { to: ROUTES.categories, label: 'Categories', icon: Boxes },
  { to: ROUTES.sales, label: 'Sales', icon: ReceiptText },
  { to: ROUTES.purchases, label: 'Purchases', icon: Truck },
  // The directory: who you sell to and buy from.
  { to: ROUTES.customers, label: 'Customers', icon: Users, groupStart: true },
  { to: ROUTES.suppliers, label: 'Suppliers', icon: Factory },
];
