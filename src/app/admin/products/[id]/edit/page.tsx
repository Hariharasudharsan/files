"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  
  const [badges, setBadges] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    fryingTemp: "",
    airFryerSetting: "",
    microwaveTime: "",
    spiceLevel: "",
    dietType: "",
    region: "",
    mealPairing: "",
    isSubscribable: false,
    subscriptionDiscountPercent: 0,
    badgeIds: [] as string[]
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/products/${resolvedParams.id}`).then(res => res.json()),
      fetch(`/api/admin/badges`).then(res => res.json())
    ])
    .then(([productData, badgesData]) => {
      if (productData.product) {
        const p = productData.product;
        if (p.variants) setVariants(p.variants);
        setFormData({
          name: p.name || "",
          slug: p.slug || "",
          description: p.description || "",
          fryingTemp: p.fryingTemp || "",
          airFryerSetting: p.airFryerSetting || "",
          microwaveTime: p.microwaveTime || "",
          spiceLevel: p.spiceLevel || "",
          dietType: p.dietType || "",
          region: p.region || "",
          mealPairing: p.mealPairing || "",
          isSubscribable: p.isSubscribable || false,
          subscriptionDiscountPercent: p.subscriptionDiscountPercent || 0,
          badgeIds: p.badges ? p.badges.map((b: any) => b.badgeId) : [],
        });
      }
      if (badgesData.badges) setBadges(badgesData.badges);
    })
    .catch(err => setError("Failed to load data"))
    .finally(() => setFetching(false));
  }, [resolvedParams.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    }
  };

  const handleBadgeChange = (badgeId: string) => {
    setFormData(prev => {
      const isSelected = prev.badgeIds.includes(badgeId);
      return {
        ...prev,
        badgeIds: isSelected 
          ? prev.badgeIds.filter(id => id !== badgeId)
          : [...prev.badgeIds, badgeId]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/products/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-surface-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-surface-600" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Edit Product</h1>
          <p className="text-surface-500 mt-1">Update product details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}
          
          <h3 className="font-semibold text-lg border-b pb-2">Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Product Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Slug</label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-surface-900">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 space-y-6">
          <h3 className="font-semibold text-lg border-b pb-2">Preparation Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Frying Temp</label>
              <input
                type="text"
                name="fryingTemp"
                value={formData.fryingTemp}
                onChange={handleChange}
                placeholder="e.g. 180°C"
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Air Fryer Setting</label>
              <input
                type="text"
                name="airFryerSetting"
                value={formData.airFryerSetting}
                onChange={handleChange}
                placeholder="e.g. 200°C for 10 mins"
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Microwave Time</label>
              <input
                type="text"
                name="microwaveTime"
                value={formData.microwaveTime}
                onChange={handleChange}
                placeholder="e.g. 2 mins on High"
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 space-y-6">
          <h3 className="font-semibold text-lg border-b pb-2">Dynamic Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Spice Level</label>
              <input
                type="text"
                name="spiceLevel"
                value={formData.spiceLevel}
                onChange={handleChange}
                placeholder="e.g. Medium, High"
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Diet Type</label>
              <input
                type="text"
                name="dietType"
                value={formData.dietType}
                onChange={handleChange}
                placeholder="e.g. Vegan, Keto"
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Region</label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="e.g. Chettinad"
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Meal Pairing</label>
              <input
                type="text"
                name="mealPairing"
                value={formData.mealPairing}
                onChange={handleChange}
                placeholder="e.g. Tea Time, Rice"
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 space-y-6">
          <h3 className="font-semibold text-lg border-b pb-2">Subscriptions & Badges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isSubscribable"
                  checked={formData.isSubscribable}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="font-medium text-surface-900">Allow Subscriptions</span>
              </label>
              
              {formData.isSubscribable && (
                <div className="space-y-2 pl-8">
                  <label className="text-sm font-semibold text-surface-900">Subscription Discount (%)</label>
                  <input
                    type="number"
                    name="subscriptionDiscountPercent"
                    value={formData.subscriptionDiscountPercent}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Product Badges</label>
              <div className="space-y-2 mt-2">
                {badges.length === 0 ? (
                  <p className="text-sm text-surface-500">No badges available. Create them in Admin.</p>
                ) : (
                  badges.map(badge => (
                    <label key={badge.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.badgeIds.includes(badge.id)}
                        onChange={() => handleBadgeChange(badge.id)}
                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-surface-800">{badge.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 space-y-6">
          <h3 className="font-semibold text-lg border-b pb-2">Variants (Pack Sizes)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-50 text-surface-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Best Value</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {variants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-surface-500">
                      No variants found.
                    </td>
                  </tr>
                ) : (
                  variants.map(variant => (
                    <tr key={variant.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <input 
                          type="radio" 
                          name="bestValueVariant"
                          checked={variant.isBestValue}
                          onChange={async () => {
                            // Optimistically update UI
                            setVariants(variants.map(v => ({ ...v, isBestValue: v.id === variant.id })));
                            try {
                              const res = await fetch(`/api/admin/products/${resolvedParams.id}/variants/${variant.id}/best-value`, {
                                method: 'PUT',
                              });
                              if (!res.ok) throw new Error();
                            } catch (error) {
                              // Revert
                              setVariants(variants);
                              setError("Failed to set best value variant");
                            }
                          }}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-surface-900">{variant.name}</td>
                      <td className="px-4 py-3 text-surface-500">{variant.itemCode}</td>
                      <td className="px-4 py-3 text-right">₹{variant.price}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/products">
            <Button type="button" variant="outline" className="px-6">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="px-8 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Product
          </Button>
        </div>
      </form>
    </div>
  );
}
