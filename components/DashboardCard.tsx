interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}

export default function DashboardCard({ title, value, subtitle, icon }: DashboardCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 text-white transform hover:scale-[1.02] transition-all duration-200 border border-white/10">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            {value}
          </p>
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}
