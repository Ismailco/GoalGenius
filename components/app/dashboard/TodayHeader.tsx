import { CalendarDays } from 'lucide-react';
import { formatDateOnly } from '@/lib/domain/date-only';

export default function TodayHeader({ date }: { date: string }) {
  return (
    <header>
      <h1 className="text-[clamp(1.75rem,3vw,2rem)] font-semibold tracking-[-0.025em] text-[var(--text-primary)]">
        Today
      </h1>
      <p className="mt-1 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <CalendarDays className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
        <time dateTime={date}>
          {formatDateOnly(date, { weekday: 'long', month: 'long', day: 'numeric' })}
        </time>
      </p>
    </header>
  );
}
