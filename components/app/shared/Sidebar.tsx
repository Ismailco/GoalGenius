'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogoMark from '@/components/app/shared/AppLogoMark';
import UserProfile from '@/components/UserProfile';
import {
  readSidebarCollapsed,
  subscribeToAppSettings,
  writeSidebarCollapsed,
} from '@/lib/app-settings';
import {
  APP_NAV_ITEMS,
  isNavigationItemActive,
} from '@/components/app/shared/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

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
      className={`sticky top-0 hidden h-screen shrink-0 p-4 transition-[width] duration-300 md:flex ${
        isCollapsed ? 'w-28' : 'w-[300px]'
      }`}
    >
      <div className="surface-panel flex h-full w-full flex-col px-3 py-4">
        <div
          className={`flex items-center px-2 pb-5 ${
            isCollapsed ? 'justify-center' : 'justify-between gap-3'
          }`}
        >
          {!isCollapsed ? (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <AppLogoMark className="shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  GoalGenius
                </p>
                <p className="truncate text-sm font-semibold text-white">
                  Focus Workspace
                </p>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-[var(--text-secondary)] hover:border-white/10 hover:bg-white/10 hover:text-white"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {!isCollapsed ? <p className="sidebar-label px-3">Workspace</p> : null}

        <nav className="flex-1 space-y-1 px-1" aria-label="Primary navigation">
          {APP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isNavigationItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shell-nav-button ${
                  isActive ? 'shell-nav-button-active' : ''
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className="h-5 w-5 shrink-0"
                  strokeWidth={isActive ? 2.3 : 1.95}
                />
                {!isCollapsed ? (
                  <span className="truncate text-sm font-medium">{item.name}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-white/5 pt-4">
          <div className={isCollapsed ? 'flex justify-center' : ''}>
            <UserProfile isMenuButton={isCollapsed} />
          </div>
        </div>
      </div>
    </aside>
  );
}
