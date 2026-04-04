'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppLogoMark from '@/components/app/shared/AppLogoMark';
import UserProfile from '@/components/UserProfile';
import {
  APP_NAV_ITEMS,
  MOBILE_PRIMARY_NAV_ITEMS,
  getActiveNavigationItem,
  isNavigationItemActive,
} from '@/components/app/shared/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const activeItem = getActiveNavigationItem(pathname);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });

  return (
    <>
      <header className="mobile-bar flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="app-button-secondary !h-11 !w-11 !rounded-[18px] !p-0"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            GoalGenius
          </p>
          <p className="truncate text-sm font-semibold text-white">
            {activeItem?.name ?? 'Workspace'}
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)]">
          {todayLabel}
        </div>
      </header>

      <div
        className={`mobile-drawer-backdrop md:hidden ${
          isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        className={`mobile-drawer md:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-out`}
      >
        <div ref={drawerRef} className="surface-panel flex h-full flex-col p-4">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AppLogoMark />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  GoalGenius
                </p>
                <p className="text-sm font-semibold text-white">Workspace</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="app-button-secondary !h-11 !w-11 !rounded-[18px] !p-0"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="sidebar-label px-2">Navigate</p>

          <nav className="flex-1 space-y-1" aria-label="Mobile navigation">
            {APP_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = isNavigationItemActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shell-nav-button ${
                    isActive ? 'shell-nav-button-active' : ''
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.3 : 1.95} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-white/5 pt-4">
            <UserProfile isMobile />
          </div>
        </div>
      </div>

      <nav className="mobile-bottom-nav grid grid-cols-4 md:hidden" aria-label="Bottom navigation">
        {MOBILE_PRIMARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = isNavigationItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2.5 text-center ${
                isActive
                  ? 'bg-[rgba(93,166,255,0.14)] text-white'
                  : 'text-[var(--text-secondary)]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.3 : 1.95} />
              <span className="text-[11px] font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
