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
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl w-full max-w-2xl border border-white/10 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex-shrink-0">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                {modalTitle}
              </h2>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
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
