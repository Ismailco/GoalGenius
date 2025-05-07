'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="min-h-screen p-8 relative bg-slate-900">
      <div className="absolute top-16 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
      <div className="max-w-6xl mx-auto relative">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-slate-100">
              {monthName} {year}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-slate-700/50 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-300" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-slate-700/50 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Days of week headers */}
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center py-2 text-sm font-semibold text-slate-400"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="h-24 bg-slate-800/30 rounded-lg border border-slate-700/30" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => (
              <div
                key={index + 1}
                className="h-24 border border-slate-700/50 rounded-lg p-2 hover:bg-slate-700/30 transition-colors backdrop-blur-sm group"
              >
                <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
