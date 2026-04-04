import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  ChartColumnBig,
  CircleCheckBig,
  LayoutDashboard,
  ListTodo,
  Milestone,
  NotebookPen,
  Target,
} from 'lucide-react';

export interface AppNavigationItem {
  href: string;
  icon: LucideIcon;
  name: string;
}

export const APP_NAV_ITEMS: AppNavigationItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, name: 'Dashboard' },
  { href: '/checkins', icon: CircleCheckBig, name: 'Check-ins' },
  { href: '/todos', icon: ListTodo, name: 'Todos' },
  { href: '/notes', icon: NotebookPen, name: 'Notes' },
  { href: '/goals', icon: Target, name: 'Goals' },
  { href: '/milestones', icon: Milestone, name: 'Milestones' },
  { href: '/calendar', icon: CalendarDays, name: 'Calendar' },
  { href: '/analytics', icon: ChartColumnBig, name: 'Analytics' },
];

export const MOBILE_PRIMARY_NAV_ITEMS = APP_NAV_ITEMS.slice(0, 4);

export function isPublicPath(pathname: string) {
  return pathname === '/' || pathname.startsWith('/auth/');
}

export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveNavigationItem(pathname: string) {
  return APP_NAV_ITEMS.find((item) => isNavigationItemActive(pathname, item.href));
}
