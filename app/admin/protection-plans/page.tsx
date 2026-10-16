"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Edit, Plus, RefreshCw, Shield, Trash2, X } from "lucide-react";

type ProtectionPlan = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  accent: "purple" | "blue";
  isActive: boolean;
  sortOrder: number;
};

type ProtectionPlanForm = Omit<ProtectionPlan, "id">;

const emptyPlan: ProtectionPlanForm = {
  title: "",
  description: "",
  price: 0,
  duration: "Year",
  accent: "purple" as const,
  isActive: true,
  sortOrder: 0,
};

export default function AdminProtectionPlansPage() {
  const [plans, setPlans] = useState<ProtectionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPlan);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/protection-plans");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load protection plans.");
      setPlans(data.plans || []);
    } catch (loadError: any) {
      setError(loadError.message || "Failed to load protection plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyPlan);
    setError("");
  };

  const editPlan = (plan: ProtectionPlan) => {
    setEditingId(plan.id);
    setForm({
      title: plan.title,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      accent: plan.accent,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
    });
    setError("");
    setSuccess("");
  };

  const savePlan = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(
        editingId ? `/api/admin/protection-plans/${encodeURIComponent(editingId)}` : "/api/admin/protection-plans",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save protection plan.");
      setSuccess(editingId ? "Protection plan updated." : "Protection plan created.");
      resetForm();
      await loadPlans();
    } catch (saveError: any) {
      setError(saveError.message || "Failed to save protection plan.");
    } finally {
      setSaving(false);
    }
  };

  const togglePlan = async (plan: ProtectionPlan) => {
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/admin/protection-plans/${encodeURIComponent(plan.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...plan, isActive: !plan.isActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update plan status.");
      setSuccess(`Plan ${data.plan.isActive ? "activated" : "deactivated"}.`);
      await loadPlans();
    } catch (toggleError: any) {
      setError(toggleError.message || "Failed to update plan status.");
    }
  };

  const deletePlan = async (plan: ProtectionPlan) => {
    if (!window.confirm(`Delete "${plan.title}"? It will no longer appear on product pages.`)) return;
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/admin/protection-plans/${encodeURIComponent(plan.id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete plan.");
      setSuccess("Protection plan deleted.");
      if (editingId === plan.id) resetForm();
      await loadPlans();
    } catch (deleteError: any) {
      setError(deleteError.message || "Failed to delete plan.");
    }
  };

  const setField = <K extends keyof ProtectionPlanForm>(key: K, value: ProtectionPlanForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-nex-blueLight" /> Product Care Plans
          </h1>
          <p className="text-xs text-nex-mist mt-1">Manage the plan names, descriptions, prices, display order, and visibility shown on product pages.</p>
        </div>
        <button onClick={() => { resetForm(); setSuccess(""); }} className="btn-primary !py-2.5 !px-5 text-xs font-bold flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Plan
        </button>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</div>}
      {success && <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-xs flex items-center gap-2"><CheckCircle className="h-4 w-4" />{success}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] gap-6 items-start">
        <section className="glass-panel bg-nex-ink border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h2 className="text-sm font-bold text-white">Available Plans</h2>
            <button onClick={loadPlans} className="text-nex-mist hover:text-white" aria-label="Refresh plans"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
          </div>
          {loading ? (
            <div className="p-10 text-center text-xs text-nex-mist">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="p-10 text-center text-xs text-nex-mist">No plans created yet.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {plans.map((plan) => (
                <article key={plan.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white truncate">{plan.title}</h3>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${plan.isActive ? "bg-emerald-500/10 text-emerald-300" : "bg-white/10 text-nex-mist"}`}>
                        {plan.isActive ? "Visible" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-xs text-nex-mist mt-1">{plan.description}</p>
                    <p className="text-xs font-bold text-nex-blueLight mt-2">₹{plan.price.toLocaleString("en-IN")} / {plan.duration}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => editPlan(plan)} className="btn-secondary !py-1.5 !px-2.5 text-[11px] inline-flex items-center gap-1"><Edit className="h-3 w-3" /> Edit</button>
                    <button onClick={() => togglePlan(plan)} className="btn-secondary !py-1.5 !px-2.5 text-[11px]">{plan.isActive ? "Hide" : "Show"}</button>
                    <button onClick={() => deletePlan(plan)} className="p-2 rounded-lg text-red-300 hover:bg-red-500/10" aria-label={`Delete ${plan.title}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <form onSubmit={savePlan} className="glass-panel bg-nex-ink border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-white">{editingId ? "Edit Protection Plan" : "Create Protection Plan"}</h2>
            {editingId && <button type="button" onClick={resetForm} className="text-nex-mist hover:text-white" aria-label="Cancel editing"><X className="h-4 w-4" /></button>}
          </div>
          <label className="block text-[11px] text-nex-mist space-y-1">
            <span>Plan Name</span>
            <input required maxLength={120} value={form.title} onChange={(event) => setField("title", event.target.value)} className="w-full rounded-lg bg-nex-black border border-white/10 px-3 py-2 text-xs text-white" />
          </label>
          <label className="block text-[11px] text-nex-mist space-y-1">
            <span>Description</span>
            <textarea required maxLength={1000} rows={3} value={form.description} onChange={(event) => setField("description", event.target.value)} className="w-full rounded-lg bg-nex-black border border-white/10 px-3 py-2 text-xs text-white resize-y" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-[11px] text-nex-mist space-y-1">
              <span>Price (₹)</span>
              <input required type="number" min={0} step="0.01" value={form.price} onChange={(event) => setField("price", Number(event.target.value))} className="w-full rounded-lg bg-nex-black border border-white/10 px-3 py-2 text-xs text-white" />
            </label>
            <label className="block text-[11px] text-nex-mist space-y-1">
              <span>Price Period</span>
              <input required maxLength={40} value={form.duration} onChange={(event) => setField("duration", event.target.value)} placeholder="Year, one-time..." className="w-full rounded-lg bg-nex-black border border-white/10 px-3 py-2 text-xs text-white" />
            </label>
            <label className="block text-[11px] text-nex-mist space-y-1">
              <span>Display Order</span>
              <input type="number" min={0} step={1} value={form.sortOrder} onChange={(event) => setField("sortOrder", Number(event.target.value))} className="w-full rounded-lg bg-nex-black border border-white/10 px-3 py-2 text-xs text-white" />
            </label>
            <label className="block text-[11px] text-nex-mist space-y-1">
              <span>Card Color</span>
              <select value={form.accent} onChange={(event) => setField("accent", event.target.value as "purple" | "blue")} className="w-full rounded-lg bg-nex-black border border-white/10 px-3 py-2 text-xs text-white">
                <option value="purple">Purple</option>
                <option value="blue">Blue</option>
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-xs text-white">
            <input type="checkbox" checked={form.isActive} onChange={(event) => setField("isActive", event.target.checked)} />
            Show this plan on product pages
          </label>
          <button disabled={saving} type="submit" className="btn-primary w-full !py-2.5 text-xs font-bold disabled:opacity-60">
            {saving ? "Saving..." : editingId ? "Save Plan Changes" : "Create Plan"}
          </button>
        </form>
      </div>
    </div>
  );
}
