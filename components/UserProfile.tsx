'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Settings, User } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { signOut, useSession } from '@/lib/auth/auth-client';
import { clearOfflineCaches, clearUserCache } from '@/lib/storage';

interface UserProfileProps {
  isMenuButton?: boolean;
  isMobile?: boolean;
  menuAlign?: 'start' | 'end';
  menuPlacement?: 'above' | 'below';
}

function getInitials(name?: string | null) {
  if (!name) {
    return 'RS';
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function UserProfile({
  isMenuButton = false,
  menuAlign = 'start',
  menuPlacement = 'above',
}: UserProfileProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = getInitials(user?.name);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const firstMenuItem = menuRef.current?.querySelector<HTMLElement>(
      '[role="menuitem"]',
    );
    firstMenuItem?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMenuOpen(false);
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  async function handleSignOut() {
    try {
      sessionStorage.setItem('goalgenius-logged-out', 'true');
      if (user?.id) {
        clearUserCache(user.id);
      }
      await clearOfflineCaches();
      const response = await signOut();
      await clearOfflineCaches();
      if (response) {
        window.location.replace('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  const menu = isMenuOpen ? (
    <div
      id={menuId}
      className={`surface-panel absolute z-[90] p-2 ${
        menuPlacement === 'below' ? 'top-full mt-2' : 'bottom-full mb-3'
      } ${
        isMenuButton
          ? `${menuAlign === 'end' ? 'right-0' : 'left-0'} w-56`
          : 'left-0 right-0'
      }`}
      role="menu"
      aria-label="Account menu"
    >
      <div className="app-surface-subtle rounded-[var(--radius-control)] border px-4 py-3">
        <p className="truncate text-sm font-semibold text-white">
          {user?.name || 'Guest User'}
        </p>
        <p className="truncate text-xs text-[var(--text-secondary)]">
          {user?.email || 'guest@email.com'}
        </p>
      </div>

      <div className="mt-2 space-y-1">
        <Link
          href="/settings"
          className="shell-nav-button min-h-[unset] !px-4 !py-3"
          role="menuitem"
          onClick={() => setIsMenuOpen(false)}
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">Settings</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="shell-nav-button min-h-[unset] w-full !px-4 !py-3 text-left hover:text-[rgb(255,220,226)]"
          role="menuitem"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </div>
  ) : null;

  if (isMenuButton) {
    return (
      <div className="relative" ref={menuRef}>
        {menu}
        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="app-button-secondary app-button-icon"
          ref={triggerRef}
          aria-label={isMenuOpen ? 'Close user menu' : 'Open user menu'}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          aria-controls={isMenuOpen ? menuId : undefined}
        >
          {user?.image ? (
            <Image
              src={user.image}
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-[var(--radius-control)]"
            />
          ) : (
            <span className="text-sm font-bold text-white">{initials}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={menuRef}>
      {menu}

      <button
        type="button"
        className="flex min-h-14 w-full items-center gap-3 rounded-[var(--radius-control)] border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] px-3 py-3 text-left hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)]"
        onClick={() => setIsMenuOpen((current) => !current)}
        ref={triggerRef}
        aria-label={isMenuOpen ? 'Close user menu' : 'Open user menu'}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        aria-controls={isMenuOpen ? menuId : undefined}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-subtle)] text-white">
          {user?.image ? (
            <Image
              src={user.image}
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-[var(--radius-control)]"
            />
          ) : (
            <span className="text-sm font-bold">{initials}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {user?.name || 'Guest User'}
          </p>
          <p className="truncate text-xs text-[var(--text-secondary)]">
            {user?.email || 'guest@email.com'}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]">
          <User className="h-4 w-4" />
        </div>
      </button>
    </div>
  );
}
