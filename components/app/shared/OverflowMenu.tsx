'use client';

import { Ellipsis } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';

interface OverflowMenuProps {
  ariaLabel: string;
  children: ReactNode;
}

export default function OverflowMenu({ ariaLabel, children }: OverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = (restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!isOpen) return;

    const firstMenuItem = containerRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    firstMenuItem?.focus();

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) closeMenu();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu(true);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative flex justify-end">
      <button
        ref={triggerRef}
        type="button"
        className="app-icon-button h-10 w-10"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Ellipsis className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 bottom-11 z-[70] min-w-40 rounded-[var(--radius-control)] border border-[var(--border-default)] bg-[var(--bg-surface-elevated)] p-1 shadow-[var(--shadow-md)] lg:top-11 lg:bottom-auto lg:z-20"
          role="menu"
          aria-label={ariaLabel}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('[role="menuitem"]')) setIsOpen(false);
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
