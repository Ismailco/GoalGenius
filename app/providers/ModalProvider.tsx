'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  showModal: (options: { title: string; content: ReactNode }) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('');

  const showModal = ({ title, content }: { title: string; content: ReactNode }) => {
    setModalTitle(title);
    setModalContent(content);
  };

  const hideModal = () => {
    setModalContent(null);
    setModalTitle('');
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modalContent && (
        <div className="app-modal-backdrop">
          <div className="app-modal-panel flex max-h-[80vh] flex-col">
            <div className="shrink-0 border-b border-white/5 p-6">
              <h2 className="text-2xl font-semibold text-white">
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
