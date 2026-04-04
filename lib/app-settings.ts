import type { Todo } from '@/app/types';

export interface AppSettings {
  defaultTodoPriority: Todo['priority'];
  enableInAppNotifications: boolean;
  showCompletedTodosByDefault: boolean;
}

export const APP_SETTINGS_STORAGE_KEY = 'goalgenius:app-settings';
export const APP_SETTINGS_UPDATED_EVENT = 'goalgenius:settings-updated';
export const SIDEBAR_COLLAPSED_STORAGE_KEY = 'sidebar-collapsed';
export const PWA_CACHE_READY_STORAGE_KEY = 'pwaCacheReady';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultTodoPriority: 'medium',
  enableInAppNotifications: true,
  showCompletedTodosByDefault: false,
};

function canUseStorage() {
  return typeof window !== 'undefined';
}

function notifySettingsUpdated() {
  if (!canUseStorage()) return;
  window.dispatchEvent(new Event(APP_SETTINGS_UPDATED_EVENT));
}

export function readAppSettings(): AppSettings {
  if (!canUseStorage()) {
    return DEFAULT_APP_SETTINGS;
  }

  try {
    const rawValue = localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (!rawValue) {
      return DEFAULT_APP_SETTINGS;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<AppSettings>;
    return {
      ...DEFAULT_APP_SETTINGS,
      ...parsedValue,
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function writeAppSettings(nextSettings: Partial<AppSettings>) {
  if (!canUseStorage()) {
    return DEFAULT_APP_SETTINGS;
  }

  const mergedSettings = {
    ...readAppSettings(),
    ...nextSettings,
  };

  localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(mergedSettings));
  notifySettingsUpdated();
  return mergedSettings;
}

export function subscribeToAppSettings(listener: () => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === APP_SETTINGS_STORAGE_KEY ||
      event.key === SIDEBAR_COLLAPSED_STORAGE_KEY ||
      event.key === PWA_CACHE_READY_STORAGE_KEY
    ) {
      listener();
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(APP_SETTINGS_UPDATED_EVENT, listener);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(APP_SETTINGS_UPDATED_EVENT, listener);
  };
}

export function readSidebarCollapsed() {
  if (!canUseStorage()) {
    return true;
  }

  const rawValue = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
  if (rawValue === null) {
    return true;
  }

  return rawValue === 'true';
}

export function writeSidebarCollapsed(isCollapsed: boolean) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(isCollapsed));
  notifySettingsUpdated();
}

export function readPwaCacheReady() {
  if (!canUseStorage()) {
    return false;
  }

  return localStorage.getItem(PWA_CACHE_READY_STORAGE_KEY) === 'true';
}

export function writePwaCacheReady(isReady: boolean) {
  if (!canUseStorage()) {
    return;
  }

  if (isReady) {
    localStorage.setItem(PWA_CACHE_READY_STORAGE_KEY, 'true');
  } else {
    localStorage.removeItem(PWA_CACHE_READY_STORAGE_KEY);
  }

  notifySettingsUpdated();
}
