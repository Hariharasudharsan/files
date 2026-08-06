import { Activity, Play, RefreshCcw, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Mock data for the UI since BullMQ requires a live Redis connection to read stats.
const QUEUES = [
  { name: "SYNC_ORDER", active: 2, waiting: 15, delayed: 0, failed: 3, completed: 1450 },
  { name: "PROCESS_WEBHOOK", active: 0, waiting: 0, delayed: 0, failed: 0, completed: 320 },
  { name: "SEND_EMAIL", active: 5, waiting: 42, delayed: 10, failed: 1, completed: 8900 },
];

export default function AdminQueuesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Background Queues</h1>
          <p className="text-surface-500 mt-1">Monitor BullMQ workers, view Dead Letter Queues, and retry jobs.</p>
        </div>
        <Button className="flex items-center gap-2">
          <RefreshCcw className="w-4 h-4" /> Refresh Stats
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {QUEUES.map((q) => (
          <div key={q.name} className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-surface-900 font-mono">{q.name}</h2>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs flex gap-2">
                  <Play className="w-3 h-3" /> Resume
                </Button>
                {q.failed > 0 && (
                  <Button variant="outline" size="sm" className="h-8 text-xs flex gap-2 border-amber-200 text-amber-700 hover:bg-amber-50">
                    <RefreshCcw className="w-3 h-3" /> Retry Failed ({q.failed})
                  </Button>
                )}
              </div>
            </div>
            <div className="p-6 grid grid-cols-5 divide-x divide-surface-100">
              <div className="px-4 text-center">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Active</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{q.active}</p>
              </div>
              <div className="px-4 text-center">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Waiting</p>
                <p className="text-2xl font-bold text-surface-900 mt-2">{q.waiting}</p>
              </div>
              <div className="px-4 text-center">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Delayed</p>
                <p className="text-2xl font-bold text-amber-500 mt-2">{q.delayed}</p>
              </div>
              <div className="px-4 text-center">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Failed (DLQ)</p>
                <p className={`text-2xl font-bold mt-2 ${q.failed > 0 ? 'text-red-600' : 'text-surface-300'}`}>{q.failed}</p>
              </div>
              <div className="px-4 text-center">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{(q.completed / 1000).toFixed(1)}k</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
