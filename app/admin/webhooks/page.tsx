import { CheckCircle2, AlertCircle, Clock, Search } from "lucide-react";

import { prisma } from "@/lib/infrastructure/database/prisma";

const formatDistanceToNow = (d: Date) => { const diff = Date.now() - new Date(d).getTime(); return `${Math.floor(diff/60000)} minutes ago`; };

export default async function WebhooksPage() {
  const webhooks = await prisma.webhookEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Incoming Webhooks</h1>
          <p className="text-surface-900/60 mt-2">Log of all webhook events from Razorpay, Shiprocket, and ERPNext.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-surface-900/40" />
          <input
            type="text"
            placeholder="Search Event ID..."
            className="border-none bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="glass rounded-3xl border border-surface-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-surface-900/60">
              <tr>
                <th className="px-6 py-4 font-semibold">Provider</th>
                <th className="px-6 py-4 font-semibold">Event Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Processed At</th>
                <th className="px-6 py-4 font-semibold">Received At</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 bg-white/50">
              {webhooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-900/60">
                    No webhooks received yet. Make sure your ngrok tunnel is configured!
                  </td>
                </tr>
              ) : (
                webhooks.map((hook) => (
                  <tr key={hook.id} className="transition-colors hover:bg-surface-50/50">
                    <td className="px-6 py-4 font-medium text-surface-950 capitalize">{hook.provider}</td>
                    <td className="px-6 py-4 font-mono text-xs text-surface-900/80 bg-surface-100 rounded inline-block mt-3 mb-3 ml-6">{hook.eventType}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={hook.status} />
                      {hook.error && (
                        <p className="mt-1 max-w-[200px] truncate text-xs text-red-500" title={hook.error}>
                          {hook.error}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-surface-900/80 whitespace-nowrap">
                      {hook.processedAt ? format(new Date(hook.processedAt), "MMM d, HH:mm:ss") : "-"}
                    </td>
                    <td className="px-6 py-4 text-surface-900/80 whitespace-nowrap">
                      {format(new Date(hook.createdAt), "MMM d, HH:mm:ss")}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-primary-600 hover:text-primary-800 font-medium text-xs">
                        View Payload
                      </button>
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
  if (status === "processed" || status === "success") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 border border-green-200">
        <CheckCircle2 className="h-3.5 w-3.5" /> Processed
      </span>
    );
  }
  if (status === "failed") {
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
