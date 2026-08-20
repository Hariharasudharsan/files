"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Loader2, Save, MapPin } from "lucide-react";
import Link from "next/link";
import { updateShippingZone, updateZonePincodes, deleteShippingZone } from "../actions";

export default function EditZoneClient({ zone, currentPincodes }: { zone: any, currentPincodes: string[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pincodesLoading, setPincodesLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: zone.name,
    estimatedDays: zone.estimatedDays,
    rate: zone.rate,
    isServiceable: zone.isServiceable
  });
  
  const [pincodeInput, setPincodeInput] = useState(currentPincodes.join(", "));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateShippingZone(zone.id, form);
      alert("Zone updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update zone");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePincodes = async () => {
    setPincodesLoading(true);
    try {
      await updateZonePincodes(zone.id, pincodeInput);
      alert("Pincodes updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update pincodes");
    } finally {
      setPincodesLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this zone and all associated pincodes?")) return;
    try {
      await deleteShippingZone(zone.id);
      router.push("/admin/shipping");
    } catch (error) {
      alert("Failed to delete zone");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/shipping" className="text-surface-500 hover:text-surface-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-950">Edit {zone.name}</h1>
          <p className="text-surface-500 text-sm mt-1">Manage zone settings and serviceable pincodes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-surface-200 p-6 space-y-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-surface-900 mb-4 border-b border-surface-100 pb-2">Zone Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-900 mb-1">Zone Name</label>
                  <input 
                    type="text" 
                    required
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full border border-surface-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-900 mb-1">Estimated Delivery Time</label>
                  <input 
                    type="text" 
                    required
                    value={form.estimatedDays}
                    onChange={e => setForm({...form, estimatedDays: e.target.value})}
                    className="w-full border border-surface-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-900 mb-1">Base Shipping Rate (₹)</label>
                  <input 
                    type="number" 
                    min={0}
                    required
                    value={form.rate}
                    onChange={e => setForm({...form, rate: Number(e.target.value)})}
                    className="w-full border border-surface-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input 
                    type="checkbox"
                    checked={form.isServiceable}
                    onChange={e => setForm({...form, isServiceable: e.target.checked})}
                    className="w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-600"
                  />
                  <span className="text-sm font-semibold text-surface-900">Zone is currently serviceable</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-100 flex justify-between">
              <Button type="button" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleDelete}>
                Delete
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </Button>
            </div>
          </form>
        </div>

        <div className="md:col-span-7">
          <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm flex flex-col h-full">
            <h2 className="text-lg font-bold text-surface-900 mb-4 border-b border-surface-100 pb-2 flex items-center justify-between">
              Serviceable Pincodes
              <span className="text-xs bg-surface-100 text-surface-600 px-2 py-1 rounded-md">{currentPincodes.length} currently assigned</span>
            </h2>
            <p className="text-sm text-surface-600 mb-4">
              Enter a comma-separated list of all 6-digit pincodes that belong to this zone. Invalid or malformed entries will be automatically ignored.
            </p>
            <textarea
              className="w-full flex-1 min-h-[300px] border border-surface-300 rounded-lg p-4 text-sm font-mono focus:outline-none focus:border-primary-500 resize-y"
              value={pincodeInput}
              onChange={e => setPincodeInput(e.target.value)}
              placeholder="600001, 600002, 600003..."
            />
            <div className="pt-4 mt-4 border-t border-surface-100 flex justify-end">
              <Button type="button" onClick={handleUpdatePincodes} disabled={pincodesLoading}>
                {pincodesLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}
                Update Pincodes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
