'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Settings, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { signOut, useSession } from '@/lib/auth/auth-client';
import { clearOfflineCaches, clearUserCache } from '@/lib/storage';

interface UserProfileProps {
  isMenuButton?: boolean;
  isMobile?: boolean;
}

function getInitials(name?: string | null) {
  if (!name) {
    return 'GG';
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
}: UserProfileProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = getInitials(user?.name);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      className={`surface-panel absolute bottom-full z-[90] mb-3 p-2 ${
        isMenuButton ? 'left-0 w-56' : 'left-0 right-0'
      }`}
      role="menu"
    >
      <div className="rounded-[18px] border border-white/5 bg-white/5 px-4 py-3">
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
          className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/5 hover:bg-white/10"
          aria-label={isMenuOpen ? 'Close user menu' : 'Open user menu'}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
        >
          {user?.image ? (
            <Image
              src={user.image}
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-[14px]"
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
        className="flex w-full items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-3 py-3 text-left hover:border-white/15 hover:bg-white/10"
        onClick={() => setIsMenuOpen((current) => !current)}
        aria-label={isMenuOpen ? 'Close user menu' : 'Open user menu'}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-[rgba(93,166,255,0.12)] text-white">
          {user?.image ? (
            <Image
              src={user.image}
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-[14px]"
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

        <div className="flex h-9 w-9 items-center justify-center rounded-[16px] border border-white/5 bg-white/5 text-[var(--text-secondary)]">
          <User className="h-4 w-4" />
        </div>
      </button>
    </div>
  );
}
