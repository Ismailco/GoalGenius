'use client';

import { useState, useEffect } from 'react';
import { CheckIn } from '@/app/types';
import { getCheckIns, deleteCheckIn } from '@/app/lib/storage';
import CreateCheckInModal from '@/app/components/CreateCheckInModal';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import AlertModal from '@/app/components/AlertModal';

export default function CheckInsPage() {

  const [mounted, setMounted] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  useEffect(() => {
    setMounted(true);
    setCheckIns(getCheckIns());
  }, []);

  // Don't render anything until mounted to prevent hydration errors
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="absolute top-16 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
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

  const handleSaveCheckIn = () => {
    setCheckIns(getCheckIns());
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
      onConfirm: () => {
        try {
          deleteCheckIn(id);
          setCheckIns(getCheckIns());
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

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getCheckInForDate = (date: Date) => {
    return checkIns.find(checkIn => isSameDay(new Date(checkIn.date), date));
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="absolute top-16 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(date => new Date(date.getFullYear(), date.getMonth() - 1))}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(date => new Date(date.getFullYear(), date.getMonth() + 1))}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((date) => {
              const checkIn = getCheckInForDate(date);
              const isCurrentDay = isToday(date);

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
                  className={`aspect-square p-2 rounded-xl border transition-all ${
                    isCurrentDay
                      ? 'border-purple-500/50 bg-purple-500/20'
                      : checkIn
                      ? 'border-blue-500/50 bg-blue-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-300">
                    {format(date, 'd')}
                  </div>
                  {checkIn && (
                    <div className="text-lg mt-1" title={`Mood: ${checkIn.mood}, Energy: ${checkIn.energy}`}>
                      {getMoodEmoji(checkIn.mood)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="space-y-6">
          {checkIns
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((checkIn) => (
              <div
                key={checkIn.id}
                className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 transform hover:scale-[1.01] transition-all duration-200 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
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
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditCheckIn(checkIn)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCheckIn(checkIn.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {checkIn.accomplishments.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Accomplishments</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {checkIn.accomplishments.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {checkIn.challenges.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Challenges</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {checkIn.challenges.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {checkIn.goals.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Goals for Tomorrow</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {checkIn.goals.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {checkIn.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Additional Notes</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{checkIn.notes}</p>
                  </div>
                )}
              </div>
            ))}

          {checkIns.length === 0 && (
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/10">
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
