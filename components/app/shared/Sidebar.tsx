'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppLogoMark from '@/components/app/shared/AppLogoMark';
import NavigationItem from '@/components/app/shared/NavigationItem';
import {
  APP_NAV_ITEMS,
  APP_UTILITY_NAV_ITEMS,
} from '@/components/app/shared/navigation';
import UserProfile from '@/components/UserProfile';
import {
  readSidebarCollapsed,
  subscribeToAppSettings,
  writeSidebarCollapsed,
} from '@/lib/app-settings';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const syncSidebarState = () => {
      setIsCollapsed(readSidebarCollapsed());
    };

    syncSidebarState();
    return subscribeToAppSettings(syncSidebarState);
  }, []);

  function toggleSidebar() {
    const nextValue = !isCollapsed;
    setIsCollapsed(nextValue);
    writeSidebarCollapsed(nextValue);
  }

  return (
    <aside
      className={`desktop-sidebar ${
        isCollapsed ? 'desktop-sidebar-collapsed' : 'desktop-sidebar-expanded'
      }`}
      aria-label="Application sidebar"
    >
      <div className="desktop-sidebar-inner">
        <header className="desktop-sidebar-header">
          <Link
            href="/dashboard"
            className={`sidebar-brand ${isCollapsed ? 'sidebar-brand-collapsed' : ''}`}
            aria-label="Rungset Today"
          >
            <AppLogoMark className="shrink-0" />
            {!isCollapsed ? <span className="sidebar-wordmark">Rungset</span> : null}
          </Link>

          <button
            type="button"
            onClick={toggleSidebar}
            className="sidebar-collapse-button"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </header>

        <nav className="sidebar-primary-nav" aria-label="Primary navigation">
          {!isCollapsed ? <p className="sidebar-label">Workspace</p> : null}
          <div className="space-y-1">
            {APP_NAV_ITEMS.map((item) => (
              <NavigationItem
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={isCollapsed}
              />
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <nav className="sidebar-utility-nav" aria-label="Utility navigation">
            {!isCollapsed ? <p className="sidebar-label">Utility</p> : null}
            <div className="space-y-1">
              {APP_UTILITY_NAV_ITEMS.map((item) => (
                <NavigationItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  collapsed={isCollapsed}
                />
              ))}
            </div>
          </nav>

          <div className="sidebar-account">
            <UserProfile isMenuButton={isCollapsed} />
          </div>
        </div>
      </div>
    </aside>
  );
}
