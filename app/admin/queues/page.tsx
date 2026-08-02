"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Clock, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

type QueueStats = {
  name: string;
  counts: {
    wait: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
};

export default function QueuesDashboard() {
  const [queues, setQueues] = useState<QueueStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/queues");
      const data = await res.json();
      if (data.success) {
        setQueues(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && queues.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Queue Management</h1>
          <p className="text-surface-900/60 mt-2">Monitor background workers and dead letter queues in real-time.</p>
        </div>
        <Button variant="outline" onClick={fetchStats}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {queues.map((q) => (
          <div key={q.name} className="glass rounded-3xl border border-surface-200 p-6 shadow-sm transition-all hover:shadow-md">
            <h2 className="mb-6 font-display text-xl font-bold text-surface-950">{q.name}</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              <StatCard title="Waiting" value={q.counts.wait} icon={<Clock className="h-5 w-5 text-amber-500" />} />
              <StatCard title="Active" value={q.counts.active} icon={<Activity className="h-5 w-5 text-blue-500" />} />
              <StatCard title="Delayed" value={q.counts.delayed} icon={<Clock className="h-5 w-5 text-purple-500" />} />
              <StatCard title="Completed" value={q.counts.completed} icon={<CheckCircle className="h-5 w-5 text-green-500" />} />
              <StatCard title="Failed" value={q.counts.failed} icon={<AlertTriangle className="h-5 w-5 text-red-500" />} />
            </div>
            {q.counts.failed > 0 && (
              <div className="mt-6 rounded-xl bg-red-50 p-4 border border-red-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-red-800">Dead Letters Detected</h3>
                  <p className="text-sm text-red-600">You have {q.counts.failed} failed jobs requiring attention.</p>
                </div>
                <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-100">
                  Inspect & Replay
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-surface-100 bg-white/50 p-4 flex flex-col items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-100">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-surface-900/60">{title}</p>
        <p className="font-display text-2xl font-bold text-surface-950">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
