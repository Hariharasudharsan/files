import { Shield, CheckCircle2 } from "lucide-react";

const ROLES = [
  {
    name: "ADMIN",
    description: "Full system access. Can modify settings, users, roles, and all e-commerce data.",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    permissions: [
      "Manage Admin Users & Roles",
      "Access System Settings",
      "Manage All E-commerce Entities",
      "Replay ERP Sync & Queues",
      "Access Audit Logs",
      "Manage CMS Content",
    ]
  },
  {
    name: "MANAGER",
    description: "E-commerce operations access. Can manage orders, products, and customers.",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    permissions: [
      "Manage Products & Inventory",
      "Manage Orders & Shipments",
      "View Customer Data",
      "Manage CMS Content",
      "View Sync Logs & Webhooks",
    ]
  },
  {
    name: "CUSTOMER",
    description: "Standard storefront user. Cannot access the admin panel.",
    color: "bg-surface-100 text-surface-700 border-surface-200",
    permissions: [
      "Place Orders",
      "Manage Own Profile",
      "View Own Order History",
    ]
  }
];

export default function AdminRolesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-surface-950">Roles & Permissions</h1>
        <p className="text-surface-500 mt-1">Review system roles and their granted capabilities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {ROLES.map((role) => (
          <div key={role.name} className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden flex flex-col">
            <div className={`p-6 border-b border-surface-100 flex items-start justify-between ${role.name === 'ADMIN' ? 'bg-purple-50/30' : role.name === 'MANAGER' ? 'bg-blue-50/30' : 'bg-surface-50'}`}>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${role.color}`}>
                  {role.name === "ADMIN" && <Shield className="w-3.5 h-3.5" />}
                  {role.name}
                </span>
                <p className="mt-4 text-sm text-surface-600 leading-relaxed min-h-[40px]">
                  {role.description}
                </p>
              </div>
            </div>
            <div className="p-6 flex-1 bg-white">
              <h4 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-4">Capabilities</h4>
              <ul className="space-y-3">
                {role.permissions.map((perm, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-surface-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
