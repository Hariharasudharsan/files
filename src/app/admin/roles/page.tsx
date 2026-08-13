import { prisma } from "@/lib/infrastructure/database/prisma";
import { Shield, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function AdminRolesPage() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: true,
      _count: {
        select: { users: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Roles & Permissions</h1>
          <p className="text-surface-500 mt-1">View system roles and their granted capabilities. This is a read-only reference.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden flex flex-col">
            <div className={`p-6 border-b border-surface-100 flex items-start justify-between ${role.name === 'ADMIN' ? 'bg-purple-50/30' : role.name === 'MANAGER' ? 'bg-blue-50/30' : 'bg-surface-50'}`}>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  role.name === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                  role.name === 'MANAGER' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                  'bg-surface-100 text-surface-700 border-surface-200'
                }`}>
                  {role.name === "ADMIN" && <Shield className="w-3.5 h-3.5" />}
                  {role.name}
                </span>
                <p className="mt-4 text-sm text-surface-600 leading-relaxed min-h-[40px]">
                  {role.description || "No description provided."}
                </p>
                <p className="mt-2 text-xs font-medium text-surface-500">
                  {role._count.users} user(s) assigned
                </p>
              </div>
            </div>
            <div className="p-6 flex-1 bg-white">
              <h4 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-4">Capabilities</h4>
              <ul className="space-y-3">
                {role.permissions.length > 0 ? (
                  role.permissions.map((perm) => (
                    <li key={perm.id} className="flex items-start gap-3 text-sm text-surface-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {perm.action} {perm.resource}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-surface-500 italic">No specific permissions</li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
