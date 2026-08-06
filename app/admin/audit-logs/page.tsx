import { ShieldAlert, Search, Info } from "lucide-react";
import { AuditService } from "@/lib/core/application/AuditService";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const logs = await AuditService.getAuditLogs(100);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-primary-600" />
            System Audit Trail
          </h1>
          <p className="text-surface-900/60 mt-2">Immutable ledger of all critical state mutations across the system.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-surface-900/40" />
          <input
            type="text"
            placeholder="Search Action or Entity..."
            className="border-none bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="glass rounded-3xl border border-surface-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-surface-900/60">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Entity Type</th>
                <th className="px-6 py-4 font-semibold">Entity ID</th>
                <th className="px-6 py-4 font-semibold">Actor (User ID)</th>
                <th className="px-6 py-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 bg-white/50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-900/60">
                    <div className="flex flex-col items-center justify-center">
                      <Info className="h-8 w-8 mb-3 text-surface-400" />
                      <p>No audit logs recorded yet.</p>
                      <p className="text-xs mt-1">Actions like checkout and payments will trigger events here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="transition-colors hover:bg-surface-50/50">
                    <td className="px-6 py-4 text-surface-900/80 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-surface-100 px-2 py-1 text-xs font-semibold text-surface-800 border border-surface-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-surface-950">{log.entity}</td>
                    <td className="px-6 py-4 font-mono text-xs text-surface-900/80">{log.entityId}</td>
                    <td className="px-6 py-4 font-mono text-xs text-surface-900/80">
                      {log.userId || <span className="text-surface-900/40 italic">System</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="group relative inline-block text-left">
                        <button className="text-xs font-medium text-primary-600 hover:text-primary-700 underline underline-offset-2">
                          View JSON
                        </button>
                        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-xl bg-surface-950 text-surface-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all p-4 text-xs font-mono overflow-auto max-h-64">
                          <pre>{JSON.stringify(log.details, null, 2)}</pre>
                        </div>
                      </div>
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
