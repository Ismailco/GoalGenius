'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

interface ModalContextType {
  showModal: (options: { title: string; content: ReactNode }) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const showModal = ({ title, content }: { title: string; content: ReactNode }) => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModalTitle(title);
    setModalContent(content);
  };

  const hideModal = () => {
    setModalContent(null);
    setModalTitle('');
    previousFocusRef.current?.focus();
    previousFocusRef.current = null;
  };

  useEffect(() => {
    if (!modalContent) return;

    const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideModal();
        return;
      }

      if (event.key !== 'Tab' || !modalRef.current) return;
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
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
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalContent]);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modalContent && (
        <div className="app-modal-backdrop">
          <div ref={modalRef} className="app-modal-panel flex max-h-[80vh] flex-col" role="dialog" aria-modal="true" aria-labelledby="app-modal-title">
            <div className="shrink-0 border-b border-white/5 p-6">
              <h2 id="app-modal-title" className="text-2xl font-semibold text-white">
                {modalTitle}
              </h2>
            </div>
            <div className="flex-grow overflow-y-auto p-6">
              {modalContent}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
