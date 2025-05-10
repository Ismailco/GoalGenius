'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Bell,
  Filter,
  CalendarClock,
  Globe2,
  Mail,
  Calendar as CalendarIcon,
  Share2
} from 'lucide-react';

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

  const isToday = (day: number) => {
    const today = new Date();
    return currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear() &&
      day === today.getDate();
  };

  const upcomingFeatures = [
    {
      title: 'Google Calendar Sync',
      description: 'Seamlessly sync your milestones with Google Calendar',
      icon: <Globe2 className="w-6 h-6 text-red-400" />
    },
    {
      title: 'Outlook Integration',
      description: 'Connect and sync with your Microsoft Outlook calendar',
      icon: <Mail className="w-6 h-6 text-blue-400" />
    },
    {
      title: 'Apple Calendar',
      description: 'Sync with Apple Calendar for iOS and macOS',
      icon: <CalendarIcon className="w-6 h-6 text-gray-400" />
    },
    {
      title: 'Smart Reminders',
      description: 'Get notified about upcoming deadlines across all calendars',
      icon: <Bell className="w-6 h-6 text-purple-400" />
    },
    {
      title: 'Calendar Sharing',
      description: 'Share your milestone calendar with team members',
      icon: <Share2 className="w-6 h-6 text-green-400" />
    },
    {
      title: 'Advanced Filters',
      description: 'Filter events by calendar source, goal, or priority',
      icon: <Filter className="w-6 h-6 text-indigo-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="absolute top-16 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 transform hover:scale-[1.01] transition-transform border border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Calendar</h1>
              <p className="text-gray-300 mt-2">Plan and track your milestones across all your calendars</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/10 text-center">
          <div className="flex items-center justify-center mb-4">
            <CalendarClock className="w-8 h-8 text-blue-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">Calendar Integration Coming Soon!</h2>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            We're working on integrating with your favorite calendar services! Soon you'll be able to sync your milestones
            with Google Calendar, Outlook, Apple Calendar, and more. Stay organized across all your platforms!
          </p>
        </div>

        {/* Upcoming Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 transform hover:scale-[1.02] transition-all duration-200"
            >
              <div className="bg-white/5 rounded-2xl p-4 inline-block mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Calendar Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-6 mt-8">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-white">
              {monthName} {year}
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5 text-gray-300" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-4">
            {/* Days of week headers */}
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center py-2 text-sm font-medium text-gray-400"
              >
                {day}
              </div>
            ))}

            {/* Empty cells for days before the first day of the month */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="aspect-square bg-white/5 rounded-2xl border border-white/10"
              />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayIsToday = isToday(day);

              return (
                <div
                  key={day}
                  className={`aspect-square relative group ${
                    dayIsToday
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                      : 'bg-white/5 hover:bg-white/10'
                  } rounded-2xl border ${
                    dayIsToday ? 'border-blue-500/50' : 'border-white/10'
                  } transition-all duration-200 p-2`}
                >
                  <span className={`text-sm font-medium ${
                    dayIsToday
                      ? 'text-blue-400'
                      : 'text-gray-300 group-hover:text-white'
                  } transition-colors`}>
                    {day}
                  </span>

                  {/* Placeholder for events/milestones */}
                  <div className="mt-2 space-y-1">
                    {/* We'll add milestone indicators here later */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
