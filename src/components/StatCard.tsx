interface StatCardProps {
  title: string;
  value: number;
  icon: string;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-md flex items-center space-x-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
