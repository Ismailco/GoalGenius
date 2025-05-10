'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { CheckIn } from '@/app/types';
import { getCheckIns, deleteCheckIn } from '@/lib/storage';
import CreateCheckInModal from '@/components/app/checkins/CreateCheckInModal';
import { format, eachDayOfInterval, isSameDay, isToday, subWeeks, startOfWeek, endOfWeek, addDays } from 'date-fns';
import AlertModal from '@/components/common/AlertModal';

function parseJsonArray(value: string[] | string | undefined | null): string[] {
  if (!value) return [];

  // If it's already an array, return it
  if (Array.isArray(value)) return value;

  // If it's a string, try to parse it
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error parsing JSON array:', e);
    return [];
  }
}

export default function CheckInsPage() {
  const [mounted, setMounted] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
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
    type: 'info'
  });
  const [yearStartDate, setYearStartDate] = useState(() => {
    const today = new Date();
    return startOfWeek(subWeeks(today, 51));
  });
  const calendarRef = useRef<HTMLDivElement>(null);

  // const accomplishments = useMemo(() => parseJsonArray(selectedCheckIn?.accomplishments), [selectedCheckIn?.accomplishments]);
  // const challenges = useMemo(() => parseJsonArray(selectedCheckIn?.challenges), [selectedCheckIn?.challenges]);
  // const goals = useMemo(() => parseJsonArray(selectedCheckIn?.goals), [selectedCheckIn?.goals]);

  useEffect(() => {
    const loadCheckIns = async () => {
      try {
        setMounted(true);
        const loadedCheckIns = await getCheckIns();
        setCheckIns(loadedCheckIns);
      } catch (error) {
        console.error('Error loading check-ins:', error);
        setAlert({
          show: true,
          title: 'Error',
          message: 'Failed to load check-ins',
          type: 'error'
        });
      }
    };

    loadCheckIns();
  }, []);

  useEffect(() => {
    if (mounted && calendarRef.current) {
      calendarRef.current.scrollLeft = calendarRef.current.scrollWidth;
    }
  }, [mounted]);

  // Don't render anything until mounted to prevent hydration errors
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="absolute  left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 transform hover:scale-[1.01] transition-transform border border-white/10">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-8 bg-white/10 rounded-xl w-3/4"></div>
                <div className="h-4 bg-white/5 rounded-xl w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveCheckIn = async () => {
    try {
      const updatedCheckIns = await getCheckIns();
      setCheckIns(updatedCheckIns);
    } catch (error) {
      console.error('Error refreshing check-ins:', error);
      setAlert({
        show: true,
        title: 'Error',
        message: 'Failed to refresh check-ins',
        type: 'error'
      });
    }
  };

  const handleEditCheckIn = (checkIn: CheckIn) => {
    setSelectedCheckIn(checkIn);
    setIsModalOpen(true);
  };

  const handleDeleteCheckIn = (id: string) => {
    setAlert({
      show: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this check-in?',
      type: 'warning',
      isConfirmation: true,
      onConfirm: async () => {
        try {
          await deleteCheckIn(id);
          const updatedCheckIns = await getCheckIns();
          setCheckIns(updatedCheckIns);
        } catch (error) {
          console.error('Error deleting check-in:', error);
          setAlert({
            show: true,
            title: 'Error',
            message: 'Failed to delete check-in',
            type: 'error'
          });
        }
      }
    });
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'great': return '😄';
      case 'good': return '🙂';
      case 'okay': return '😐';
      case 'bad': return '😕';
      case 'terrible': return '😢';
      default: return '🙂';
    }
  };

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'high': return '⚡️';
      case 'medium': return '✨';
      case 'low': return '🔋';
      default: return '✨';
    }
  };

  const getCheckInForDate = (date: Date) => {
    return checkIns.find(checkIn => isSameDay(new Date(checkIn.date), date));
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="absolute  left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 transform hover:scale-[1.01] transition-transform border border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Daily Check-ins</h1>
              <p className="text-gray-300 mt-2">Track your progress and reflect on your journey</p>
            </div>
            <button
              onClick={() => {
                setSelectedCheckIn(undefined);
                setSelectedDate(undefined);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Check-in
            </button>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 transform hover:scale-[1.01] transition-transform border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Progress & Growth Timeline
              </h2>
              <p className="text-sm text-gray-400 mt-1">Track your daily journey and personal development</p>
            </div>
          </div>

          <div className="flex mt-6">
            {/* Days of week labels */}
            <div className="flex flex-col pr-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="h-7 flex items-center">
                  <span className="text-xs font-medium text-gray-400 w-10">{day}</span>
                </div>
              ))}
            </div>

            {/* Scrollable calendar area */}
            <div
              ref={calendarRef}
              className="overflow-x-auto flex-grow scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex min-w-max pb-2">
                {/* Calendar grid */}
                <div className="flex">
                  {Array.from({ length: 52 }, (_, weekIndex) => {
                    const weekStart = addDays(yearStartDate, weekIndex * 7);
                    const weekDays = eachDayOfInterval({
                      start: weekStart,
                      end: endOfWeek(weekStart)
                    });

                    return (
                      <div key={weekIndex} className="flex flex-col">
                        {weekDays.map((date) => {
                          const checkIn = getCheckInForDate(date);
                          const isCurrentDay = isToday(date);

                          // Get mood-based color
                          let moodColor = 'bg-white/5';
                          if (checkIn) {
                            switch (checkIn.mood) {
                              case 'terrible':
                                moodColor = 'bg-red-500/30 hover:bg-red-500/40';
                                break;
                              case 'bad':
                                moodColor = 'bg-orange-500/30 hover:bg-orange-500/40';
                                break;
                              case 'okay':
                                moodColor = 'bg-yellow-500/30 hover:bg-yellow-500/40';
                                break;
                              case 'good':
                                moodColor = 'bg-lime-500/30 hover:bg-lime-500/40';
                                break;
                              case 'great':
                                moodColor = 'bg-green-500/30 hover:bg-green-500/40';
                                break;
                            }
                          }

                          return (
                            <button
                              key={date.toISOString()}
                              onClick={() => {
                                if (checkIn) {
                                  setSelectedCheckIn(checkIn);
                                  setSelectedDate(undefined);
                                } else {
                                  setSelectedCheckIn(undefined);
                                  setSelectedDate(format(date, 'yyyy-MM-dd'));
                                }
                                setIsModalOpen(true);
                              }}
                              className={`h-7 w-7 flex flex-col items-center justify-center transition-all group relative ${
                                isCurrentDay
                                  ? 'bg-purple-500/20 ring-1 ring-purple-500/50'
                                  : `${moodColor} ring-1 ${checkIn ? 'ring-white/20' : 'ring-white/10'} hover:ring-white/30`
                              }`}
                            >
                              <div className="font-medium text-gray-300 text-[10px]">
                                {format(date, 'd')}
                              </div>
                              {checkIn && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                                  <span className="text-[10px]" title={`${checkIn.mood} / ${checkIn.energy}`}>
                                    {getMoodEmoji(checkIn.mood)}
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <p className="text-xs text-gray-400">
              {format(yearStartDate, 'MMM d, yyyy')} — {format(new Date(), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="space-y-3">
          {checkIns
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((checkIn) => {
              const checkInAccomplishments = parseJsonArray(checkIn.accomplishments);
              const checkInChallenges = parseJsonArray(checkIn.challenges);
              const checkInGoals = parseJsonArray(checkIn.goals);

              return (
                <details
                  key={checkIn.id}
                  className="group bg-white/5 backdrop-blur-lg rounded-xl transition-all duration-200 border border-white/10"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" title={`Mood: ${checkIn.mood}`}>
                        {getMoodEmoji(checkIn.mood)}
                      </span>
                      <span className="text-2xl" title={`Energy: ${checkIn.energy}`}>
                        {getEnergyIcon(checkIn.energy)}
                      </span>
                      <span className="text-lg font-medium text-white">
                        {format(new Date(checkIn.date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleEditCheckIn(checkIn);
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteCheckIn(checkIn.id);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors text-sm"
                      >
                        Delete
                      </button>
                      <svg
                        className="w-5 h-5 text-gray-400 transform transition-transform group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>
                  <div className="px-4 pb-4 pt-2 border-t border-white/10">
                    <div className="space-y-4">
                      {checkInAccomplishments.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-gray-400">Accomplishments</h3>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {checkInAccomplishments.map((item: string, index: number) => (
                              <li key={index} className="flex items-start gap-2 text-gray-300">
                                <span className="text-green-400 mt-1">✓</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {checkInChallenges.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-gray-400">Challenges</h3>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {checkInChallenges.map((item: string, index: number) => (
                              <li key={index} className="flex items-start gap-2 text-gray-300">
                                <span className="text-yellow-400 mt-1">!</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {checkInGoals.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-gray-400">Goals for Tomorrow</h3>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {checkInGoals.map((item: string, index: number) => (
                              <li key={index} className="flex items-start gap-2 text-gray-300">
                                <span className="text-blue-400 mt-1">○</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {checkIn.notes && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-gray-400">Additional Notes</h3>
                          <p className="text-gray-300 whitespace-pre-wrap bg-white/5 rounded-xl p-4 border border-white/10">
                            {checkIn.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              );
            })}

          {checkIns.length === 0 && (
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 text-center border border-white/10">
              <p className="text-gray-300 text-lg">
                No check-ins yet. Start tracking your daily progress!
              </p>
            </div>
          )}
        </div>

        <CreateCheckInModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCheckIn(undefined);
            setSelectedDate(undefined);
          }}
          existingCheckIn={selectedCheckIn}
          defaultDate={selectedDate}
          onSave={handleSaveCheckIn}
        />

        {alert.show && (
          <AlertModal
            title={alert.title}
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ ...alert, show: false })}
            isConfirmation={alert.isConfirmation}
            onConfirm={alert.onConfirm}
          />
        )}
      </div>
    </div>
  );
}
