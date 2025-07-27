import { useEffect, useState } from "react";
import StatCard from "./StatCard";

interface Metric {
  title: string;
  value: number;
  icon: string;
}

export default function DashboardContent() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { title: "Total Jobs Found", value: 1254, icon: "📄" },
    { title: "Applications Sent", value: 389, icon: "📤" },
    { title: "Interviews Scheduled", value: 72, icon: "🗓️" },
    { title: "Hired", value: 18, icon: "✅" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(metrics =>
        metrics.map(metric => ({
          ...metric,
          value: metric.value + Math.floor(Math.random() * 5),
        }))
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="text-2xl font-semibold mb-6">Dashboard Overview</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <StatCard key={i} title={m.title} value={m.value} icon={m.icon} />
        ))}
      </div>
    </div>
  );
}
