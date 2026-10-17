"use client";

import { useEffect, useState } from "react";
import {
  Wrench,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";

export default function AdminServicesManager() {
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Repairs");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("2-4 Hours");
  const [iconName, setIconName] = useState("Laptop");

  const loadServices = async () => {
    const list = await dbHelper.services.list();
    setServices(list);
  };

  useEffect(() => {
    loadServices();
    window.addEventListener("nexbyte-realtime", loadServices);
    return () => window.removeEventListener("nexbyte-realtime", loadServices);
  }, []);

  const handleOpenAdd = () => {
    setEditingService(null);
    setTitle("");
    setDescription("");
    setCategory("Repairs");
    setPrice("1500");
    setDuration("2-4 Hours");
    setIconName("Laptop");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: any) => {
    setEditingService(s);
    setTitle(s.title);
    setDescription(s.description || "");
    setCategory(s.category || "Repairs");
    setPrice(String(s.price ?? ""));
    setDuration(s.duration || "2-4 Hours");
    setIconName(s.iconName || "Laptop");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;

    const payload = {
      title,
      description,
      category,
      price: Number(price),
      duration,
      iconName,
      status: editingService ? editingService.status : "enabled"
    };

    if (editingService) {
      await dbHelper.services.update(editingService.id, payload);
    } else {
      await dbHelper.services.create(payload);
    }

    setIsModalOpen(false);
    setEditingService(null);
    loadServices();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service configuration?")) {
      await dbHelper.services.delete(id);
      loadServices();
    }
  };

  const handleToggleStatus = async (s: any) => {
    const nextStatus = s.status === "enabled" ? "disabled" : "enabled";
    await dbHelper.services.update(s.id, { status: nextStatus });
    loadServices();
  };

  const filteredServices = services.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">IT Services Management</h1>
          <p className="text-xs text-nex-mist mt-0.5">Configure software installation fees, diagnostics durations, and AMC structures.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn-primary !py-2.5 !px-4 text-xs flex items-center gap-1.5"
        >
          <PlusCircle className="h-4 w-4" /> Add Service Configuration
        </button>
      </div>

      {/* Search Strip */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
          <input
            type="text"
            placeholder="Search service title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-nex-black border border-white/[0.08] pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Services List Table */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <Wrench className="h-10 w-10 text-nex-mist mx-auto mb-3" />
          <p className="text-xs text-white">No services found matching search query.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 bg-nex-ink overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-white border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01] text-nex-mist font-semibold">
                  <th className="py-3 px-5">Service Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price / Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((s) => (
                  <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                    
                    {/* Title */}
                    <td className="py-4.5 px-5">
                      <div className="font-semibold text-white">{s.title}</div>
                      <div className="text-[10px] text-nex-mist mt-0.5 max-w-[320px] truncate">{s.description}</div>
                    </td>

                    {/* Category */}
                    <td className="py-4.5 px-4 font-medium text-white/80">
                      {s.category || "General Repairs"}
                    </td>

                    {/* Pricing */}
                    <td className="py-4.5 px-4">
                      <div className="font-bold text-white">Rs. {(s.price ?? 0).toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-nex-mist mt-0.5">Est. Time: {s.duration || "N/A"}</div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(s)}
                        className={`flex items-center gap-1 text-[10px] font-bold uppercase transition-colors ${
                          s.status === "enabled" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {s.status === "enabled" ? (
                          <>
                            <ToggleRight className="h-5 w-5 text-green-400" /> Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-5 w-5 text-red-400" /> Disabled
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-5 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="h-8 w-8 rounded-full bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 flex items-center justify-center inline-flex text-white"
                        title="Edit Details"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="h-8 w-8 rounded-full bg-red-500/10 border border-transparent hover:border-red-500/20 hover:bg-red-500/20 flex items-center justify-center inline-flex text-red-400"
                        title="Delete Service"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="glass-panel relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue sm:p-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-base font-bold text-white mb-5">
              {editingService ? "Edit Service Parameters" : "Register IT Service Profile"}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs text-white/80 font-semibold">Service Name *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken screen replacement"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs text-white/80 font-semibold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of warranty, fault testing protocols..."
                  rows={3}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Fee / Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1500"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 2-4 Hours"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Service Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Repairs / Installation"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Icon mapping */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Design Icon (Lucide ID)</label>
                  <select
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    className="w-full rounded-xl bg-nex-ink border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Laptop">Laptop Icon</option>
                    <option value="Cpu">CPU Chip</option>
                    <option value="MonitorDot">Screen Monitor</option>
                    <option value="Terminal">OS Terminal</option>
                    <option value="Wifi">WiFi Networks</option>
                    <option value="Printer">Printer Setup</option>
                    <option value="HardDrive">Hard Drive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary !py-2 !px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary !py-2 !px-5"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
