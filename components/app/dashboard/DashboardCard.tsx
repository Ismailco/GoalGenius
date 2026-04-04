interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}

export default function DashboardCard({ title, value, subtitle, icon }: DashboardCardProps) {
  return (
    <div className="surface-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            {title}
          </h3>
          <p className="stat-value mt-3">{value}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{subtitle}</p>
        </div>
        <div className="icon-chip h-12 w-12 shrink-0 rounded-[18px]">
          {icon}
        </div>
      </div>
    </div>
  );
}
