interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}

export default function SectionHeader({ title, icon, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-xl">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}
