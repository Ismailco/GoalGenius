'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckIn } from '@/app/types';
import { getCheckIns, deleteCheckIn } from '@/lib/storage';
import CreateCheckInModal from '@/components/app/checkins/CreateCheckInModal';
import { format, eachDayOfInterval, isSameDay, isToday, subWeeks, startOfWeek, endOfWeek, addDays } from 'date-fns';
import AlertModal from '@/components/common/AlertModal';

function parseJsonArray(value: string[] | string | undefined | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error parsing JSON array:', e);
    return [];
  }
}

export default function CheckInsClient() {
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

  useEffect(() => {
    const loadCheckIns = async () => {
      try {
        const loadedCheckIns = await getCheckIns();
        setCheckIns(loadedCheckIns);
        setMounted(true);
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="absolute left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
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

  // ... rest of your existing component code ...
}
