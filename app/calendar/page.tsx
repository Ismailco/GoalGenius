'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Filter,
  CalendarClock,
  Globe2,
  Mail,
  Calendar as CalendarIcon,
  Share2
} from 'lucide-react';
import { AppPage, AppPageHeader } from '@/components/app/shared/AppPage';

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
    <AppPage>
      <AppPageHeader
        eyebrow="Calendar"
        title="Dates stay visible, integrations stay separate"
        description="The calendar surface is ready for milestone planning now and third-party sync later."
      />

      <section className="surface-panel p-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <CalendarClock className="mr-3 h-8 w-8 text-[var(--accent)]" />
            <h2 className="text-2xl font-bold text-white">Calendar Integration Coming Soon!</h2>
          </div>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
            We&apos;re working on integrating with your favorite calendar services! Soon you&apos;ll be able to sync your milestones
            with Google Calendar, Outlook, Apple Calendar, and more. Stay organized across all your platforms!
          </p>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {upcomingFeatures.map((feature, index) => (
            <div
              key={index}
              className="surface-card p-6"
            >
              <div className="icon-chip mb-4 h-14 w-14 rounded-[20px]">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-[var(--text-secondary)]">{feature.description}</p>
            </div>
          ))}
      </div>

      <section className="surface-panel mt-2 p-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">
              {monthName} {year}
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={previousMonth}
                className="app-button-secondary !h-11 !w-11 !rounded-[18px] !p-0"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5 text-[var(--text-secondary)]" />
              </button>
              <button
                onClick={nextMonth}
                className="app-button-secondary !h-11 !w-11 !rounded-[18px] !p-0"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5 text-[var(--text-secondary)]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-sm font-medium text-[var(--text-muted)]"
              >
                {day}
              </div>
            ))}

            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="aspect-square rounded-2xl border border-white/10 bg-[rgba(8,17,30,0.42)]"
              />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayIsToday = isToday(day);

              return (
                <div
                  key={day}
                  className={`aspect-square relative group ${
                    dayIsToday
                      ? 'bg-[rgba(93,166,255,0.12)]'
                      : 'bg-[rgba(8,17,30,0.42)] hover:bg-white/5'
                  } rounded-2xl border ${
                    dayIsToday ? 'border-[rgba(93,166,255,0.28)]' : 'border-white/10'
                  } transition-all duration-200 p-2`}
                >
                  <span className={`text-sm font-medium ${
                    dayIsToday
                      ? 'text-[var(--accent)]'
                      : 'text-[var(--text-secondary)] group-hover:text-white'
                  } transition-colors`}>
                    {day}
                  </span>

                  <div className="mt-2 space-y-1">
                  </div>
                </div>
              );
            })}
          </div>
      </section>
    </AppPage>
  );
}
