interface DashboardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardSection({ children, className = '' }: DashboardSectionProps) {
  return (
    <section className={`bg-white/5 backdrop-blur-lg rounded-3xl p-6 transform hover:scale-[1.01] transition-transform border border-white/10 ${className}`}>
      {children}
    </section>
  );
}
