interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}

export default function SectionHeader({ title, icon, action }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="icon-chip h-11 w-11 rounded-[16px]">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Section
          </p>
          <h2 className="text-xl font-semibold text-white md:text-2xl">{title}</h2>
        </div>
      </div>
      {action}
    </div>
  );
}
