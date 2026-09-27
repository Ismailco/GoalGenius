'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import AppModal from '@/components/app/shared/AppModal';

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
        <AppModal title={modalTitle} onClose={hideModal}>
          {modalContent}
        </AppModal>
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
