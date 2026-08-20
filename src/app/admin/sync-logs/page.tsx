import { CheckCircle2, AlertCircle, Clock, Search } from "lucide-react";

import { prisma } from "@/lib/infrastructure/database/prisma";

const formatDistanceToNow = (d: Date) => { const diff = Date.now() - new Date(d).getTime(); return `${Math.floor(diff/60000)} minutes ago`; };

import { replaySync } from "./actions";

export default async function SyncLogsPage() {
  const logs = await prisma.eRPSync.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">ERP Sync Logs</h1>
          <p className="text-surface-900/60 mt-2">Audit trail of all data synchronization with ERPNext.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-surface-900/40" />
          <input
            type="text"
            placeholder="Search Entity ID..."
            className="border-none bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="glass rounded-3xl border border-surface-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-surface-900/60">
              <tr>
                <th className="px-6 py-4 font-semibold">Entity Type</th>
                <th className="px-6 py-4 font-semibold">Entity ID</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Target System</th>
                <th className="px-6 py-4 font-semibold">Target ID</th>
                <th className="px-6 py-4 font-semibold">Attempts</th>
                <th className="px-6 py-4 font-semibold">Last Updated</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 bg-white/50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-surface-900/60">
                    No sync logs found yet. Once orders are placed, they will appear here.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-surface-50/50">
                    <td className="px-6 py-4 font-medium text-surface-950">{log.entityType}</td>
                    <td className="px-6 py-4 font-mono text-xs text-surface-900/80">{log.entityId}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={log.status} />
                      {log.lastError && (
                        <p className="mt-1 max-w-[200px] truncate text-xs text-red-500" title={log.lastError}>
                          {log.lastError}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-surface-900/80">{log.targetSystem}</td>
                    <td className="px-6 py-4 font-mono text-xs text-surface-900/80">{log.targetId || "-"}</td>
                    <td className="px-6 py-4 text-surface-900/80">{log.attempts}</td>
                    <td className="px-6 py-4 text-surface-900/80 whitespace-nowrap">
                      {new Date(log.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === "FAILED" && (
                        <form action={replaySync}>
                          <input type="hidden" name="logId" value={log.id} />
                          <button type="submit" className="px-3 py-1.5 bg-surface-100 hover:bg-surface-200 text-surface-700 text-xs font-semibold rounded-lg transition-colors border border-surface-300">
                            Replay Sync
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "SUCCESS") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 border border-green-200">
        <CheckCircle2 className="h-3.5 w-3.5" /> Success
      </span>
    );
  }
  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 border border-red-200">
        <AlertCircle className="h-3.5 w-3.5" /> Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200">
      <Clock className="h-3.5 w-3.5" /> Pending
    </span>
  );
}
