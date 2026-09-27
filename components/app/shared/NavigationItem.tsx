import Link from 'next/link';
import type { AppNavigationItem } from '@/components/app/shared/navigation';
import { isNavigationItemActive } from '@/components/app/shared/navigation';

interface NavigationItemProps {
  collapsed?: boolean;
  item: AppNavigationItem;
  onNavigate?: () => void;
  pathname: string;
}

export default function NavigationItem({
  collapsed = false,
  item,
  onNavigate,
  pathname,
}: NavigationItemProps) {
  const Icon = item.icon;
  const isActive = isNavigationItemActive(pathname, item);

  return (
    <Link
      href={item.href}
      prefetch={false}
      onClick={onNavigate}
      className={`shell-nav-button ${
        isActive ? 'shell-nav-button-active' : ''
      } ${collapsed ? 'shell-nav-button-collapsed' : ''}`}
      aria-current={isActive ? 'page' : undefined}
      aria-label={collapsed ? item.name : undefined}
      data-tooltip={collapsed ? item.name : undefined}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.9} />
      {!collapsed ? <span className="truncate text-sm font-medium">{item.name}</span> : null}
    </Link>
  );
}
