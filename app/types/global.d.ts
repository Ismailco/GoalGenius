interface AddNotificationFunction {
  (notification: { title: string; message: string; type?: 'success' | 'error' | 'warning' | 'info'; duration?: number }): void;
}

interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

declare global {
  interface Window {
    addNotification?: AddNotificationFunction;
  }
  interface WindowEventMap {
    fetch: FetchEvent;
  }
}

export {};
