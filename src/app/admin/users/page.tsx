import { prisma } from "@/lib/infrastructure/database/prisma";
import { Shield, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { role: true },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">System Users</h1>
          <p className="text-surface-500 mt-1">Manage administrators, managers, and customer accounts.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-surface-500">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Email Verified</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-surface-900">{user.name}</p>
                        <p className="text-xs text-surface-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                      user.role?.name === "ADMIN" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      user.role?.name === "MANAGER" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-surface-100 text-surface-600 border-surface-200"
                    }`}>
                      {user.role?.name === "ADMIN" && <Shield className="w-3 h-3" />}
                      {user.role?.name || "CUSTOMER"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.emailVerified ? (
                      <span className="text-green-600 font-medium">Verified</span>
                    ) : (
                      <span className="text-amber-500 font-medium">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-surface-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a href={`/admin/users/${user.id}`} className="inline-block p-2 text-surface-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50">
                      <MoreHorizontal className="w-5 h-5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
