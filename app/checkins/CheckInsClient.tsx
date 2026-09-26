'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CheckIn, Goal } from '@/app/types';
import { getCheckIns, getGoals, deleteCheckIn } from '@/lib/storage';
import { WORKSPACE_SYNC_EVENT } from '@/lib/workspace-sync-events';
import { formatDateOnly, todayDateOnly } from '@/lib/domain/date-only';
import { groupCheckInsByDate, sortCheckInsDescending } from '@/lib/domain/checkins';
import CreateCheckInModal from '@/components/app/checkins/CreateCheckInModal';
import AlertModal from '@/components/common/AlertModal';
import { AppPage } from '@/components/app/shared/AppPage';
import CheckInsEmptyState from '@/components/app/checkins/CheckInsEmptyState';
import CheckInsHeader from '@/components/app/checkins/CheckInsHeader';
import CheckInHistory from '@/components/app/checkins/CheckInHistory';
import CheckInsSkeleton from '@/components/app/checkins/CheckInsSkeleton';
import ReviewActivity from '@/components/app/checkins/ReviewActivity';

interface AlertState {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isConfirmation?: boolean;
  onConfirm?: () => void | Promise<void>;
}

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [goalFilter, setGoalFilter] = useState('all');
  const [alert, setAlert] = useState<AlertState | null>(null);

  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true);

    try {
      const [loadedCheckIns, loadedGoals] = await Promise.all([getCheckIns(), getGoals()]);
      setCheckIns(loadedCheckIns);
      setGoals(loadedGoals);
      setError(null);
    } catch (loadError) {
      console.error('Error loading check-ins:', loadError);
      setError('Check-ins could not load. Check your connection and try again.');
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(true);

    const handleWorkspaceSync = () => void load();
    window.addEventListener(WORKSPACE_SYNC_EVENT, handleWorkspaceSync);
    return () => window.removeEventListener(WORKSPACE_SYNC_EVENT, handleWorkspaceSync);
  }, [load]);

  const goalsById = useMemo(() => new Map(goals.map((goal) => [goal.id, goal])), [goals]);

  const visibleCheckIns = useMemo(() => {
    const filtered = goalFilter === 'all'
      ? checkIns
      : checkIns.filter((checkIn) => goalFilter === 'standalone' ? !checkIn.goalId : checkIn.goalId === goalFilter);
    return sortCheckInsDescending(filtered);
  }, [checkIns, goalFilter]);

  const checkInsByDate = useMemo(() => groupCheckInsByDate(visibleCheckIns), [visibleCheckIns]);
  const today = todayDateOnly();

  const openCreate = (date?: string) => {
    setSelectedCheckIn(undefined);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const openEdit = (checkIn: CheckIn) => {
    setSelectedCheckIn(checkIn);
    setSelectedDate(checkIn.date);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCheckIn(undefined);
  };

  const handleSave = (savedCheckIn: CheckIn) => {
    setSelectedDate(savedCheckIn.date);
    closeModal();
    void load();
  };

  const handleDelete = (checkIn: CheckIn) => {
    setAlert({
      title: 'Delete check-in?',
      message: `Delete the check-in from ${formatDateOnly(checkIn.date, { month: 'long', day: 'numeric', year: 'numeric' })}${checkIn.goalId && goalsById.has(checkIn.goalId) ? ` for ${goalsById.get(checkIn.goalId)?.title}` : ''}?`,
      type: 'warning',
      isConfirmation: true,
      onConfirm: async () => {
        try {
          await deleteCheckIn(checkIn.id);
          if (selectedDate === checkIn.date) setSelectedDate(undefined);
          await load();
        } catch (deleteError) {
          console.error('Error deleting check-in:', deleteError);
          window.addNotification?.({
            title: 'Error',
            message: 'The check-in could not be deleted. Please try again.',
            type: 'error',
          });
        }
      },
    });
  };

  if (loading) return <AppPage><CheckInsSkeleton /></AppPage>;

  if (error) {
    return (
      <AppPage>
        <CheckInsHeader onCheckIn={() => openCreate()} />
        <section className="app-empty-state p-8" role="alert">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Check-ins could not load</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{error}</p>
          <button type="button" className="app-button-secondary app-button-sm mt-4" onClick={() => void load(true)}>Retry</button>
        </section>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <CheckInsHeader onCheckIn={() => openCreate()} />

      {checkIns.length === 0 ? (
        <CheckInsEmptyState onCheckIn={() => openCreate()} />
      ) : (
        <>
          <ReviewActivity
            today={today}
            checkInsByDate={checkInsByDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onCheckIn={openCreate}
            goalsById={goalsById}
            goalFilter={goalFilter}
            goalOptions={goals}
            onGoalFilterChange={(value) => {
              setGoalFilter(value);
              setSelectedDate(undefined);
            }}
          />

          <CheckInHistory
            checkIns={visibleCheckIns}
            goalsById={goalsById}
            today={today}
            allCheckInsExist={checkIns.length > 0}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      <CreateCheckInModal
        isOpen={isModalOpen}
        onClose={closeModal}
        existingCheckIn={selectedCheckIn}
        defaultDate={selectedDate}
        availableGoals={goals}
        allowGoalSelection
        onSave={handleSave}
      />

      {alert ? (
        <AlertModal
          title={alert.title}
          message={alert.message}
          type={alert.type}
          isConfirmation={alert.isConfirmation}
          onConfirm={alert.onConfirm}
          confirmLabel="Delete check-in"
          onClose={() => setAlert(null)}
        />
      ) : null}
    </AppPage>
  );
}
