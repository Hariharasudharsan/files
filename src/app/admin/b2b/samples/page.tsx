"use client";

import React, { useState, useEffect } from "react";
import { Check, X, Clock, PackageCheck } from "lucide-react";

export default function AdminSampleQueuePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    const res = await fetch("/api/admin/b2b/samples");
    if (res.ok) {
      setRequests(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/b2b/samples/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchRequests();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading queue...</div>;

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Sample Requests</h1>
        <p className="text-gray-500 mt-1">Manage sample kit requests from prospective B2B buyers.</p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">Business Details</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Contact</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Address</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 font-semibold text-right text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{req.businessName}</p>
                  <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(req.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{req.contactName}</p>
                  <p className="text-gray-500">{req.email}</p>
                  <p className="text-gray-500">{req.phone}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <p className="line-clamp-2 max-w-xs">{JSON.stringify(req.address)}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                    req.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    req.status === 'APPROVED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' :
                    'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {req.status === 'PENDING' && <Clock className="w-3 h-3" />}
                    {req.status === 'APPROVED' && <Check className="w-3 h-3" />}
                    {req.status === 'REJECTED' && <X className="w-3 h-3" />}
                    {req.status === 'FULFILLED' && <PackageCheck className="w-3 h-3" />}
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  {req.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateStatus(req.id, 'APPROVED')} className="text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors" title="Approve">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => updateStatus(req.id, 'REJECTED')} className="text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors" title="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {req.status === 'APPROVED' && (
                    <button onClick={() => updateStatus(req.id, 'FULFILLED')} className="text-green-600 hover:bg-green-50 p-2 rounded-md transition-colors flex items-center gap-2 border border-green-200">
                      <PackageCheck className="w-4 h-4" /> <span className="text-xs font-semibold pr-1">Mark Fulfilled</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No sample requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
