interface DashboardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardSection({ children, className = '' }: DashboardSectionProps) {
  return (
    <section className={`surface-panel p-6 ${className}`}>
      {children}
    </section>
  );
}
