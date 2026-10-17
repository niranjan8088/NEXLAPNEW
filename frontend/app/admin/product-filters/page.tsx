"use client";

import { useEffect, useState, useMemo } from "react";
import {
  SlidersHorizontal,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  PlusCircle,
  Tag,
  Search,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";
import { DEFAULT_FILTER_DEFINITIONS, buildDynamicCatalogFilters } from "@/lib/filterEngine";
import { FilterDefinition, FilterOption, FilterType } from "@/lib/types/ecommerce";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS = [
  { val: "all", label: "Global (All Categories)" },
  { val: "business_laptops", label: "Business Laptops & Refurbished" },
  { val: "storage", label: "Storage (SSD / HDD)" },
  { val: "ram", label: "RAM / Memory" },
  { val: "cctv", label: "CCTV Systems" },
  { val: "peripherals", label: "Peripherals & Accessories" },
];

const FILTER_TYPES: { type: FilterType; label: string }[] = [
  { type: "multi-select", label: "Multi-Select Checkboxes" },
  { type: "single-select", label: "Single Select Dropdown" },
  { type: "boolean", label: "Boolean Toggle (Yes / No)" },
  { type: "price-range", label: "Price Range Slider" },
  { type: "range", label: "Numeric Range" },
  { type: "rating", label: "Customer Ratings" },
  { type: "checkbox", label: "Single Checkbox" },
];

export default function AdminProductFiltersPage() {
  const [filters, setFilters] = useState<FilterDefinition[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<FilterDefinition | null>(null);

  // Form Fields
  const [filterId, setFilterId] = useState("");
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [categoryId, setCategoryId] = useState("business_laptops");
  const [type, setType] = useState<FilterType>("multi-select");
  const [unit, setUnit] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [options, setOptions] = useState<FilterOption[]>([]);
  
  // Option Input State
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");

  // Preview State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewCategory, setPreviewCategory] = useState("business_laptops");

  const loadData = async () => {
    try {
      const [filterList, prodList] = await Promise.all([
        dbHelper.filterDefinitions.list(),
        dbHelper.products.list(),
      ]);
      setFilters(filterList && filterList.length > 0 ? filterList : DEFAULT_FILTER_DEFINITIONS);
      setProducts(prodList || []);
    } catch (e) {
      console.error("Failed to load filter definitions", e);
      setFilters(DEFAULT_FILTER_DEFINITIONS);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("nexbyte-realtime", loadData);
    return () => window.removeEventListener("nexbyte-realtime", loadData);
  }, []);

  // Filter List Display
  const filteredList = useMemo(() => {
    return filters.filter((f) => {
      if (selectedCategoryTab !== "all" && f.categoryId !== "all" && f.categoryId !== selectedCategoryTab) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return f.name.toLowerCase().includes(q) || f.key.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [filters, selectedCategoryTab, search]);

  const handleOpenAdd = () => {
    setEditingFilter(null);
    setFilterId(`flt-custom-${Date.now()}`);
    setName("");
    setKey("");
    setCategoryId("business_laptops");
    setType("multi-select");
    setUnit("");
    setEnabled(true);
    setSortOrder(filters.length + 1);
    setOptions([]);
    setNewOptionLabel("");
    setNewOptionValue("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: FilterDefinition) => {
    setEditingFilter(f);
    setFilterId(f.id);
    setName(f.name);
    setKey(f.key);
    setCategoryId(f.categoryId);
    setType(f.type);
    setUnit(f.unit || "");
    setEnabled(f.enabled);
    setSortOrder(f.sortOrder);
    setOptions(f.options ? [...f.options] : []);
    setNewOptionLabel("");
    setNewOptionValue("");
    setIsModalOpen(true);
  };

  const handleAddOption = () => {
    if (!newOptionLabel) return;
    const val = newOptionValue || newOptionLabel;
    if (options.some((o) => o.value === val)) return;
    setOptions([...options, { label: newOptionLabel, value: val }]);
    setNewOptionLabel("");
    setNewOptionValue("");
  };

  const handleRemoveOption = (val: string) => {
    setOptions(options.filter((o) => o.value !== val));
  };

  const handleSaveFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !key) return;

    const payload: FilterDefinition = {
      id: filterId || `flt-${Date.now()}`,
      name: name.trim(),
      key: key.trim(),
      categoryId,
      type,
      unit: unit.trim(),
      enabled,
      sortOrder: Number(sortOrder) || 1,
      options: options.length > 0 ? options : undefined,
      createdAt: editingFilter?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedList: FilterDefinition[];
    if (editingFilter) {
      updatedList = filters.map((f) => (f.id === editingFilter.id ? payload : f));
    } else {
      updatedList = [...filters, payload];
    }

    setFilters(updatedList);
    await dbHelper.filterDefinitions.save(updatedList);
    setIsModalOpen(false);
  };

  const handleToggleEnabled = async (id: string) => {
    const updated = filters.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f));
    setFilters(updated);
    await dbHelper.filterDefinitions.save(updated);
  };

  const handleDeleteFilter = async (id: string) => {
    if (confirm("Are you sure you want to delete this filter configuration?")) {
      const updated = filters.filter((f) => f.id !== id);
      setFilters(updated);
      await dbHelper.filterDefinitions.save(updated);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= filteredList.length) return;

    const newList = [...filters];
    const currentItem = filteredList[index];
    const targetItem = filteredList[targetIdx];

    const tempOrder = currentItem.sortOrder;
    currentItem.sortOrder = targetItem.sortOrder;
    targetItem.sortOrder = tempOrder;

    setFilters(newList);
    await dbHelper.filterDefinitions.save(newList);
  };

  const handleResetDefaults = async () => {
    if (confirm("Reset all catalog filters to system default configuration?")) {
      setFilters(DEFAULT_FILTER_DEFINITIONS);
      await dbHelper.filterDefinitions.save(DEFAULT_FILTER_DEFINITIONS);
    }
  };

  // Preview Filter Data Calculation
  const previewFilterGroups = useMemo(() => {
    return buildDynamicCatalogFilters(products, previewCategory, filters);
  }, [products, previewCategory, filters]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="h-6 w-6 text-nex-blue" />
            Dynamic Product Filters Management
          </h1>
          <p className="text-xs text-nex-mist mt-1">
            Configure category-aware hardware specification filters, reorder filter groups, and manage dynamic options.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="rounded-xl bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Eye className="h-4 w-4" /> Preview Customer Filters
          </button>
          <button
            onClick={handleOpenAdd}
            className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5"
          >
            <PlusCircle className="h-4 w-4" /> Create New Filter
          </button>
        </div>
      </div>

      {/* Filter Category Tabs & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-nex-ink flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.val}
              onClick={() => setSelectedCategoryTab(cat.val)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border",
                selectedCategoryTab === cat.val
                  ? "bg-nex-blue text-white border-nex-blue shadow-glow-blue font-bold"
                  : "bg-white/5 text-nex-mist border-white/10 hover:text-white"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-nex-mist" />
            <input
              type="text"
              placeholder="Search filter name or key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-nex-black border border-white/10 pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>

          <button
            onClick={handleResetDefaults}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-nex-mist hover:text-white hover:bg-white/10 transition-colors"
            title="Reset Filters to Default"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Definitions Table */}
      <div className="glass-panel rounded-2xl border border-white/5 bg-nex-ink overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-white border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.01] text-nex-mist font-semibold">
                <th className="py-3 px-4 w-12 text-center">Order</th>
                <th className="py-3 px-4">Filter Name &amp; Key</th>
                <th className="py-3 px-4">Category Assignment</th>
                <th className="py-3 px-4">Filter Type</th>
                <th className="py-3 px-4">Configured Options</th>
                <th className="py-3 px-4 text-center">Enabled</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-nex-mist">
                    No filter definitions configured for this category tab.
                  </td>
                </tr>
              ) : (
                filteredList.map((f, idx) => (
                  <tr key={f.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                    
                    {/* Sort Order & Reorder Controls */}
                    <td className="py-3.5 px-4 text-center font-mono text-white/60">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-bold text-white text-xs">{f.sortOrder}</span>
                        <div className="flex flex-col">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleReorder(idx, "up")}
                            className="p-0.5 text-nex-mist hover:text-white disabled:opacity-20"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            disabled={idx === filteredList.length - 1}
                            onClick={() => handleReorder(idx, "down")}
                            className="p-0.5 text-nex-mist hover:text-white disabled:opacity-20"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Filter Name & Key */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{f.name}</div>
                      <div className="text-[10px] text-nex-mist font-mono">key: <span className="text-nex-blueLight">{f.key}</span> {f.unit && `(unit: ${f.unit})`}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-white/80">
                        {CATEGORY_OPTIONS.find((c) => c.val === f.categoryId)?.label || f.categoryId}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 font-semibold text-nex-mist">
                      {FILTER_TYPES.find((t) => t.type === f.type)?.label || f.type}
                    </td>

                    {/* Options Pills */}
                    <td className="py-3.5 px-4">
                      {f.options && f.options.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {f.options.slice(0, 4).map((opt) => (
                            <span key={opt.value} className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-white/5">
                              {opt.label}
                            </span>
                          ))}
                          {f.options.length > 4 && (
                            <span className="text-[10px] text-nex-mist font-bold">+ {f.options.length - 4} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-nex-mist italic">Auto Dynamic Options</span>
                      )}
                    </td>

                    {/* Enabled Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleEnabled(f.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all border",
                          f.enabled
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}
                      >
                        {f.enabled ? "Active" : "Disabled"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(f)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                        title="Edit Filter Settings"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFilter(f.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete Filter Definition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT FILTER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="glass-panel relative w-full max-w-xl overflow-y-auto max-h-[90vh] rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue sm:p-8 z-10 text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-nex-blue" />
              {editingFilter ? "Modify Filter Definition" : "Create New Catalog Filter"}
            </h3>

            <form onSubmit={handleSaveFilter} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Filter Display Name */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Filter Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. RAM Capacity"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Filter Field Key */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Spec Key / Attribute *</label>
                  <input
                    type="text"
                    required
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="e.g. ramCapacity"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Assignment */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Target Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl bg-nex-ink border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.val} value={c.val}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Control Type */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Filter UI Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as FilterType)}
                    className="w-full rounded-xl bg-nex-ink border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    {FILTER_TYPES.map((t) => (
                      <option key={t.type} value={t.type}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Sort Order */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Unit Representation */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Unit (Optional)</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. GB, GHz, ₹"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Enabled Toggle */}
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                      className="rounded bg-nex-black border-white/20 text-nex-blue"
                    />
                    <span className="text-xs font-bold text-white">Active Filter</span>
                  </label>
                </div>
              </div>

              {/* DYNAMIC OPTION MANAGEMENT */}
              {type !== "boolean" && type !== "price-range" && (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs text-nex-blueLight font-bold uppercase tracking-wider">
                      Filter Option Definitions ({options.length})
                    </h4>
                    <span className="text-[10px] text-nex-mist">Add custom values like 128 GB</span>
                  </div>

                  {/* Options List */}
                  {options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-black/40 rounded-lg">
                      {options.map((opt) => (
                        <span key={opt.value} className="inline-flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
                          <span>{opt.label}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(opt.value)}
                            className="text-white/40 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add Option Input Row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOptionLabel}
                      onChange={(e) => setNewOptionLabel(e.target.value)}
                      placeholder="Option label e.g. 128 GB"
                      className="flex-1 rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newOptionValue}
                      onChange={(e) => setNewOptionValue(e.target.value)}
                      placeholder="Value (optional)"
                      className="flex-1 rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="rounded-xl bg-nex-blue hover:bg-blue-600 text-white px-3 py-2 text-xs font-bold"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-nex-blue hover:bg-blue-600 text-white px-5 py-2.5 text-xs font-bold shadow-glow-blue"
                >
                  Save Filter Definition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW CUSTOMER FILTERS MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowPreviewModal(false)} />

          <div className="glass-panel relative w-full max-w-md overflow-y-auto max-h-[90vh] rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl z-10 text-white">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <h3 className="font-display text-base font-bold flex items-center gap-2 text-purple-300">
                <Eye className="h-5 w-5" /> Customer Sidebar Filter Preview
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Renders active dynamic options and live product counts.
              </p>
            </div>

            {/* Category Selector for Preview */}
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-300 block mb-1">Select Category to Preview:</label>
              <select
                value={previewCategory}
                onChange={(e) => setPreviewCategory(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-white/10 p-2.5 text-xs font-bold text-white focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.val} value={c.val}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Simulated Customer Sidebar */}
            <div className="space-y-4 rounded-2xl bg-slate-950 p-4 border border-white/10 max-h-96 overflow-y-auto">
              {previewFilterGroups.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">No active filters for this category.</div>
              ) : (
                previewFilterGroups.map((group) => (
                  <div key={group.definition.id} className="border-b border-white/5 pb-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                      {group.definition.name} {group.definition.unit && `(${group.definition.unit})`}
                    </h4>

                    {group.definition.type === "boolean" ? (
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input type="checkbox" className="rounded text-nex-blue" />
                        <span>Enable Filter</span>
                      </label>
                    ) : group.definition.type === "price-range" ? (
                      <div className="space-y-1">
                        <input type="range" min={0} max={200000} className="w-full accent-nex-blue" />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>₹0</span>
                          <span>₹2,00,000</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {group.availableOptions.map((opt) => (
                          <label key={opt.value} className="flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer">
                            <span className="flex items-center gap-2">
                              <input type="checkbox" className="rounded border-white/20 bg-slate-900 text-nex-blue" />
                              <span>{opt.label}</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                              {opt.count}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-full rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs py-2.5"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
