'use client';

import { useState, useCallback, useEffect } from 'react';
import Notification from './Notification';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export default function NotificationContainer() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((notification: Omit<NotificationItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  }, []);

  useEffect(() => {
    window.addNotification = addNotification;
    return () => {
      delete window.addNotification;
    };
  }, [addNotification]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute top-0 right-0 flex flex-col gap-2 p-4 max-h-screen overflow-hidden">
        {notifications.map(notification => (
          <div key={notification.id} className="pointer-events-auto">
            <Notification
              {...notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
