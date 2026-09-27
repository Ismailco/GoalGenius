'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppLogoMark from '@/components/app/shared/AppLogoMark';
import NavigationItem from '@/components/app/shared/NavigationItem';
import { APP_NAV_ITEMS } from '@/components/app/shared/navigation';
import UserProfile from '@/components/UserProfile';
import {
  readSidebarCollapsed,
  subscribeToAppSettings,
  writeSidebarCollapsed,
} from '@/lib/app-settings';
import logoFull from '@/public/images/rungset-logo-full.png';

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
          <button
            type="button"
            onClick={toggleSidebar}
            className={`sidebar-brand sidebar-brand-toggle ${
              isCollapsed ? 'sidebar-brand-collapsed' : ''
            }`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <AppLogoMark className="shrink-0" />
            ) : (
              <Image
                src={logoFull}
                alt="Rungset"
                className="sidebar-full-logo"
                priority
              />
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
          <UserProfile isMenuButton={isCollapsed} />
        </div>
      </div>
    </aside>
  );
}
