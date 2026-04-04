'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CloudDownload,
  Database,
  Download,
  LayoutPanelLeft,
  LogOut,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useNotification } from '@/app/providers/NotificationProvider';
import { cacheAppPages } from '@/app/providers/ServiceWorkerProvider';
import type { Todo } from '@/app/types';
import { AppPage, AppPageHeader, AppPanel } from '@/components/app/shared/AppPage';
import AlertModal from '@/components/common/AlertModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  DEFAULT_APP_SETTINGS,
  readAppSettings,
  readPwaCacheReady,
  readSidebarCollapsed,
  subscribeToAppSettings,
  writeAppSettings,
  writePwaCacheReady,
  writeSidebarCollapsed,
  type AppSettings,
} from '@/lib/app-settings';
import { signOut, useSession } from '@/lib/auth/auth-client';
import {
  clearUserCache,
  deleteCheckIn,
  deleteGoal,
  deleteMilestone,
  deleteNote,
  deleteTodo,
  getCheckIns,
  getGoals,
  getMilestones,
  getNotes,
  getTodos,
} from '@/lib/storage';

type NotificationPermissionState = NotificationPermission | 'unsupported';

interface WorkspaceCounts {
  checkIns: number;
  goals: number;
  milestones: number;
  notes: number;
  todos: number;
}

const EMPTY_COUNTS: WorkspaceCounts = {
  checkIns: 0,
  goals: 0,
  milestones: 0,
  notes: 0,
  todos: 0,
};

interface ToggleRowProps {
  checked: boolean;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ checked, description, label, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[20px] border border-white/10 bg-[rgba(8,17,30,0.42)] px-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full border transition-colors ${
          checked
            ? 'border-[rgba(93,166,255,0.32)] bg-[rgba(93,166,255,0.24)]'
            : 'border-white/10 bg-white/5'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="surface-card-compact surface-card">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-[-0.04em] text-white">
        {value}
      </p>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { hasPermission, requestPermission } = useNotification();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [pwaCacheReady, setPwaCacheReady] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>('default');
  const [counts, setCounts] = useState<WorkspaceCounts>(EMPTY_COUNTS);
  const [isOnline, setIsOnline] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isCaching, setIsCaching] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isResettingData, setIsResettingData] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isConfirmation?: boolean;
    onConfirm?: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info',
  });

  async function loadWorkspaceCounts() {
    const [goals, milestones, notes, todos, checkIns] = await Promise.all([
      getGoals(),
      getMilestones(),
      getNotes(),
      getTodos(),
      getCheckIns(),
    ]);

    setCounts({
      checkIns: checkIns.length,
      goals: goals.length,
      milestones: milestones.length,
      notes: notes.length,
      todos: todos.length,
    });
  }

  useEffect(() => {
    const syncSettings = () => {
      setSettings(readAppSettings());
      setSidebarCollapsed(readSidebarCollapsed());
      setPwaCacheReady(readPwaCacheReady());
      setIsOnline(typeof navigator === 'undefined' ? true : navigator.onLine);

      if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotificationPermission(Notification.permission);
      } else {
        setNotificationPermission('unsupported');
      }
    };

    syncSettings();
    void loadWorkspaceCounts();

    const unsubscribe = subscribeToAppSettings(syncSettings);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (hasPermission) {
      setNotificationPermission('granted');
    }
  }, [hasPermission]);

  const totalItems = useMemo(
    () =>
      counts.goals +
      counts.milestones +
      counts.notes +
      counts.todos +
      counts.checkIns,
    [counts],
  );

  function updateSettings(nextPartial: Partial<AppSettings>) {
    const nextSettings = writeAppSettings(nextPartial);
    setSettings(nextSettings);
  }

  function downloadJsonFile(filename: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleExportWorkspace() {
    setIsExporting(true);

    try {
      const [goals, milestones, notes, todos, checkIns] = await Promise.all([
        getGoals(),
        getMilestones(),
        getNotes(),
        getTodos(),
        getCheckIns(),
      ]);

      downloadJsonFile(
        `goalgenius-workspace-${new Date().toISOString().slice(0, 10)}.json`,
        {
          exportedAt: new Date().toISOString(),
          userId: session?.user?.id ?? null,
          goals,
          milestones,
          notes,
          todos,
          checkIns,
        },
      );

      setAlert({
        show: true,
        title: 'Export ready',
        message: 'Your workspace JSON has been downloaded.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error exporting workspace:', error);
      setAlert({
        show: true,
        title: 'Export failed',
        message: 'The workspace export could not be completed.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  }

  async function handleEnableNotifications() {
    const permission = await requestPermission();
    setNotificationPermission(permission);
  }

  async function handleCacheWorkspace() {
    setIsCaching(true);

    try {
      await cacheAppPages();
      writePwaCacheReady(true);
      setPwaCacheReady(true);
      setAlert({
        show: true,
        title: 'Offline cache ready',
        message: 'The app pages were cached for offline use.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error caching app pages:', error);
      setAlert({
        show: true,
        title: 'Caching failed',
        message: 'The app could not finish preparing offline pages.',
        type: 'error',
      });
    } finally {
      setIsCaching(false);
    }
  }

  async function handleClearLocalCache() {
    if (!session?.user?.id) {
      return;
    }

    setIsClearingCache(true);

    try {
      clearUserCache(session.user.id);
      writePwaCacheReady(false);

      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
      }

      setPwaCacheReady(false);
      await loadWorkspaceCounts();
      setAlert({
        show: true,
        title: 'Local cache cleared',
        message: 'Cached app data was removed. The next refresh will fetch fresh data.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error clearing local cache:', error);
      setAlert({
        show: true,
        title: 'Clear cache failed',
        message: 'The local cache could not be cleared.',
        type: 'error',
      });
    } finally {
      setIsClearingCache(false);
    }
  }

  async function resetWorkspaceData() {
    setIsResettingData(true);

    try {
      const [goals, milestones, notes, todos, checkIns] = await Promise.all([
        getGoals(),
        getMilestones(),
        getNotes(),
        getTodos(),
        getCheckIns(),
      ]);

      for (const milestone of milestones) {
        await deleteMilestone(milestone.id);
      }

      for (const note of notes) {
        await deleteNote(note.id);
      }

      for (const todo of todos) {
        await deleteTodo(todo.id);
      }

      for (const checkIn of checkIns) {
        await deleteCheckIn(checkIn.id);
      }

      for (const goal of goals) {
        await deleteGoal(goal.id);
      }

      await loadWorkspaceCounts();
      setAlert({
        show: true,
        title: 'Workspace reset',
        message: 'All goals, milestones, notes, todos, and check-ins were deleted.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error resetting workspace:', error);
      setAlert({
        show: true,
        title: 'Reset failed',
        message: 'The workspace data could not be fully deleted.',
        type: 'error',
      });
    } finally {
      setIsResettingData(false);
    }
  }

  async function handleSignOut() {
    try {
      const response = await signOut();
      if (response) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  const notificationStatusLabel =
    notificationPermission === 'unsupported'
      ? 'Unsupported'
      : notificationPermission === 'granted'
        ? 'Enabled'
        : notificationPermission === 'denied'
          ? 'Blocked'
          : 'Not enabled';

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Settings"
        title="Control how GoalGenius behaves"
        description="Manage the app behavior, offline readiness, notifications, and your workspace data from one place."
        meta={
          <>
            <span className={`app-pill ${isOnline ? 'app-pill-success' : 'app-pill-warning'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <span className="app-pill app-pill-blue">{notificationStatusLabel} notifications</span>
            <span className={`app-pill ${pwaCacheReady ? 'app-pill-success' : 'app-pill-warning'}`}>
              {pwaCacheReady ? 'Offline cache ready' : 'Offline cache not ready'}
            </span>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <AppPanel className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="icon-chip h-12 w-12 rounded-[18px]">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Account</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Signed-in identity and account access.
              </p>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-[rgba(8,17,30,0.42)] p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(93,166,255,0.12)]">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User avatar"
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-white">
                    {(session?.user?.name ?? 'GG')
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join('')
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-white">
                  {session?.user?.name || 'Guest User'}
                </p>
                <p className="truncate text-sm text-[var(--text-secondary)]">
                  {session?.user?.email || 'No email available'}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  User ID: {session?.user?.id || 'Unavailable'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="app-button-secondary" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </AppPanel>

        <AppPanel className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="icon-chip h-12 w-12 rounded-[18px]">
              <LayoutPanelLeft className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Workspace behavior</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Preferences that immediately change how the app behaves.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <ToggleRow
              checked={sidebarCollapsed}
              label="Keep the sidebar collapsed by default"
              description="Useful if you prefer a tighter desktop layout when the app loads."
              onChange={(checked) => {
                setSidebarCollapsed(checked);
                writeSidebarCollapsed(checked);
              }}
            />

            <ToggleRow
              checked={settings.showCompletedTodosByDefault}
              label="Show completed todos by default"
              description="Applies to the todos page without needing to toggle the filter each time."
              onChange={(checked) =>
                updateSettings({ showCompletedTodosByDefault: checked })
              }
            />

            <ToggleRow
              checked={settings.enableInAppNotifications}
              label="Enable in-app toast notifications"
              description="Controls the notification toasts that appear inside GoalGenius."
              onChange={(checked) =>
                updateSettings({ enableInAppNotifications: checked })
              }
            />

            <div className="rounded-[20px] border border-white/10 bg-[rgba(8,17,30,0.42)] px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    Default priority for new todos
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    Preselect the priority that should appear when you create a new todo.
                  </p>
                </div>

                <div className="w-40 shrink-0">
                  <select
                    value={settings.defaultTodoPriority}
                    onChange={(event) =>
                      updateSettings({
                        defaultTodoPriority: event.target.value as Todo['priority'],
                      })
                    }
                    className="app-select"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </AppPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AppPanel className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="icon-chip h-12 w-12 rounded-[18px]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Notifications & offline</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Browser permission and offline readiness for the app shell.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[20px] border border-white/10 bg-[rgba(8,17,30,0.42)] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Desktop notifications</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Current permission: {notificationStatusLabel}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  disabled={
                    notificationPermission === 'granted' ||
                    notificationPermission === 'unsupported'
                  }
                  className="app-button disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Bell className="h-4 w-4" />
                  Enable
                </button>
              </div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-[rgba(8,17,30,0.42)] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Offline cache</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {pwaCacheReady
                      ? 'Core pages have been cached for offline access.'
                      : 'Prepare the app shell so the core pages are available offline.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCacheWorkspace}
                  disabled={isCaching}
                  className="app-button disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCaching ? <LoadingSpinner size="small" /> : <CloudDownload className="h-4 w-4" />}
                  Cache now
                </button>
              </div>
            </div>
          </div>
        </AppPanel>

        <AppPanel className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="icon-chip h-12 w-12 rounded-[18px]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Workspace data</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Export, clear local caches, or reset all tracked items.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <MetricCard label="Goals" value={counts.goals} />
            <MetricCard label="Milestones" value={counts.milestones} />
            <MetricCard label="Notes" value={counts.notes} />
            <MetricCard label="Todos" value={counts.todos} />
            <MetricCard label="Check-ins" value={counts.checkIns} />
          </div>

          <div className="mt-6 rounded-[20px] border border-white/10 bg-[rgba(8,17,30,0.42)] p-4">
            <p className="text-sm font-semibold text-white">Total tracked items</p>
            <p className="mt-2 text-4xl font-bold tracking-[-0.05em] text-white">
              {totalItems}
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={handleExportWorkspace}
              disabled={isExporting}
              className="app-button disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExporting ? <LoadingSpinner size="small" /> : <Download className="h-4 w-4" />}
              Export JSON
            </button>

            <button
              type="button"
              onClick={() =>
                setAlert({
                  show: true,
                  title: 'Clear local cache?',
                  message:
                    'This removes cached workspace data and offline page caches on this device only.',
                  type: 'warning',
                  isConfirmation: true,
                  onConfirm: () => {
                    void handleClearLocalCache();
                  },
                })
              }
              disabled={isClearingCache}
              className="app-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isClearingCache ? <LoadingSpinner size="small" /> : <ShieldCheck className="h-4 w-4" />}
              Clear local cache
            </button>

            <button
              type="button"
              onClick={() =>
                setAlert({
                  show: true,
                  title: 'Delete all workspace data?',
                  message:
                    'This will permanently remove all goals, milestones, notes, todos, and check-ins for your account.',
                  type: 'warning',
                  isConfirmation: true,
                  onConfirm: () => {
                    void resetWorkspaceData();
                  },
                })
              }
              disabled={isResettingData}
              className="app-button-danger md:col-span-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResettingData ? <LoadingSpinner size="small" /> : <Trash2 className="h-4 w-4" />}
              Reset workspace
            </button>
          </div>
        </AppPanel>
      </div>

      {alert.show ? (
        <AlertModal
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert((current) => ({ ...current, show: false }))}
          isConfirmation={alert.isConfirmation}
          onConfirm={alert.onConfirm}
        />
      ) : null}
    </AppPage>
  );
}
