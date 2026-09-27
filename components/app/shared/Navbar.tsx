'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AppLogoMark from '@/components/app/shared/AppLogoMark';
import NavigationItem from '@/components/app/shared/NavigationItem';
import {
  APP_NAV_ITEMS,
  MOBILE_PRIMARY_NAV_ITEMS,
  getActiveNavigationItem,
  isNavigationItemActive,
} from '@/components/app/shared/navigation';
import UserProfile from '@/components/UserProfile';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Navbar() {
  const pathname = usePathname();
  const activeItem = getActiveNavigationItem(pathname);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMenuOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }

      if (event.key !== 'Tab' || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.hasAttribute('disabled'));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  function closeDrawer(returnFocus = true) {
    setIsMenuOpen(false);
    if (returnFocus) {
      requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  }

  return (
    <>
      <header className="mobile-bar lg:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="app-button-secondary app-button-icon"
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation-drawer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <p className="mobile-bar-title">{activeItem?.name ?? 'Workspace'}</p>

        <UserProfile isMenuButton menuAlign="end" menuPlacement="below" />
      </header>

      {isMenuOpen ? (
        <>
          <button
            type="button"
            className="mobile-drawer-backdrop lg:hidden"
            onClick={() => closeDrawer()}
            aria-label="Close navigation menu"
          />

          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            className="mobile-drawer lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="mobile-drawer-panel">
              <header className="mobile-drawer-header">
                <Link
                  href="/dashboard"
                  prefetch={false}
                  className="sidebar-brand"
                  onClick={() => closeDrawer(false)}
                  aria-label="Rungset Today"
                >
                  <AppLogoMark className="shrink-0" />
                  <span className="sidebar-wordmark">Rungset</span>
                </Link>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => closeDrawer()}
                  className="app-button-secondary app-button-icon"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <nav className="mobile-drawer-nav" aria-label="Mobile primary navigation">
                <p className="sidebar-label">Workspace</p>
                <div className="space-y-1">
                  {APP_NAV_ITEMS.map((item) => (
                    <NavigationItem
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      onNavigate={() => closeDrawer(false)}
                    />
                  ))}
                </div>
              </nav>

              <div className="mobile-drawer-account">
                <UserProfile isMobile />
              </div>
            </div>
          </div>
        </>
      ) : null}

      <nav className="mobile-bottom-nav lg:hidden" aria-label="Mobile primary navigation">
        {MOBILE_PRIMARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = isNavigationItemActive(pathname, item);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`mobile-bottom-nav-item ${
                isActive ? 'mobile-bottom-nav-item-active' : ''
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.9} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
