"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Laptop,
  Search,
  Filter,
  Phone,
  MessageCircle,
  X,
  FileSpreadsheet,
  Save,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";
import Image from "next/image";
import { getSafeImageSrc } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "text-nex-blueLight bg-nex-blue/10 border-nex-blue/20" },
  { value: "reviewing", label: "Reviewing", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { value: "contacted", label: "Contacted", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { value: "recommendation_sent", label: "Recommendation Sent", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { value: "customer_interested", label: "Customer Interested", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { value: "converted", label: "Converted", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { value: "closed", label: "Closed", color: "text-white/50 bg-white/5 border-white/10" },
  { value: "cancelled", label: "Cancelled", color: "text-red-400 bg-red-500/10 border-red-500/20" },
];

function LaptopEnquiriesContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams ? searchParams.get("id") : null;

  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [productsCatalog, setProductsCatalog] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Detail & Recommendation Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [adminNotesText, setAdminNotesText] = useState("");
  const [customerReplyText, setCustomerReplyText] = useState("");
  const [recommendedProductsList, setRecommendedProductsList] = useState<any[]>([]);
  const [showProductSelectorModal, setShowProductSelectorModal] = useState(false);
  const [savingEnquiry, setSavingEnquiry] = useState(false);

  const loadData = async () => {
    const [enqList, prodList] = await Promise.all([
      dbHelper.laptopEnquiries.list(),
      dbHelper.products.list()
    ]);
    setEnquiries(enqList);
    setProductsCatalog(prodList);

    // Deep link auto-highlighting (Req #10)
    if (targetId) {
      const match = enqList.find(
        (e: any) =>
          e.id === targetId ||
          e.reference_id?.toLowerCase() === targetId.toLowerCase()
      );
      if (match) {
        setSelectedEnquiry(match);
        setAdminNotesText(match.admin_notes || "");
        setCustomerReplyText(match.customer_reply || "");
        setRecommendedProductsList(match.recommended_products || []);
      }
    }
  };

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener("nexbyte-realtime", handler);
    return () => window.removeEventListener("nexbyte-realtime", handler);
  }, [targetId]);

  const handleOpenDetail = (e: any) => {
    setSelectedEnquiry(e);
    setAdminNotesText(e.admin_notes || "");
    setCustomerReplyText(e.customer_reply || "");
    setRecommendedProductsList(e.recommended_products || []);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await dbHelper.laptopEnquiries.update(id, { status: newStatus });
    loadData();
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry((prev: any) => ({ ...prev, status: newStatus }));
    }
  };

  const handleSaveDetailModal = async () => {
    if (!selectedEnquiry) return;
    setSavingEnquiry(true);
    try {
      await dbHelper.laptopEnquiries.update(selectedEnquiry.id, {
        status: selectedEnquiry.status,
        admin_notes: adminNotesText,
        customer_reply: customerReplyText,
        recommended_products: recommendedProductsList,
      });
      loadData();
      setSelectedEnquiry(null);
    } catch (err) {
      alert("Failed to update enquiry.");
    } finally {
      setSavingEnquiry(false);
    }
  };

  const handleToggleRecommendProduct = (prod: any) => {
    setRecommendedProductsList((prev) => {
      const exists = prev.some((p) => p.id === prod.id);
      if (exists) {
        return prev.filter((p) => p.id !== prod.id);
      } else {
        return [...prev, {
          id: prod.id,
          title: prod.title,
          price: prod.price,
          image: prod.image,
          category: prod.category,
          specs: prod.specs
        }];
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this laptop enquiry permanently?")) {
      await dbHelper.laptopEnquiries.delete(id);
      loadData();
    }
  };

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Reference ID,Name,Phone,Email,City,Laptop Type,Budget,Brand,Processor,RAM,Storage,GPU,Condition,Use Case,Requirements,Status,Date\n";
    enquiries.forEach((e) => {
      csv += `"${e.reference_id || e.id}","${e.customer_name}","${e.phone}","${e.email || ""}","${e.city || ""}","${e.laptop_type || ""}","${e.budget || ""}","${e.brand_preference || ""}","${e.processor_preference || ""}","${e.ram_preference || ""}","${e.storage_preference || ""}","${e.gpu_preference || ""}","${e.condition || ""}","${e.use_case || ""}","${(e.requirements || e.message || "").replace(/"/g, '""')}","${e.status}","${e.created_at}"\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "NexLapTech_Laptop_Enquiries.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = enquiries.filter((e) => {
    const query = search.toLowerCase();
    const matchSearch =
      e.customer_name?.toLowerCase().includes(query) ||
      (e.phone || "").includes(query) ||
      (e.reference_id || "").toLowerCase().includes(query) ||
      (e.laptop_type || "").toLowerCase().includes(query) ||
      (e.city || "").toLowerCase().includes(query);

    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Laptop Enquiries Portal</h1>
          <p className="text-xs text-nex-mist mt-0.5">Manage customer laptop requirements, budgets, technician recommendations, and status workflows.</p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary !py-2.5 !px-4 text-xs flex items-center gap-1.5">
          <FileSpreadsheet className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
          <input
            type="text"
            placeholder="Search reference ID (LE-2026-...), name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-nex-black border border-white/[0.08] pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-nex-mist shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Main Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-white/5">
          <Laptop className="h-10 w-10 text-nex-mist mx-auto mb-3" />
          <p className="text-xs text-white font-medium">No laptop enquiries found.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 bg-nex-ink overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-white border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01] text-nex-mist font-semibold">
                  <th className="py-3.5 px-5">Ref &amp; Customer</th>
                  <th className="py-3.5 px-4">Requirement &amp; Budget</th>
                  <th className="py-3.5 px-4">Specs Needed</th>
                  <th className="py-3.5 px-4">Status &amp; Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const statusCfg = STATUS_OPTIONS.find((s) => s.value === e.status) || STATUS_OPTIONS[0];
                  const waText = encodeURIComponent(`Hi ${e.customer_name}, this is NexLapTech regarding your laptop enquiry ${e.reference_id || ""}. We reviewed your requirements (${e.laptop_type}) and would like to share suitable laptop options.`);
                  
                  return (
                    <tr key={e.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                      
                      {/* Ref & Customer */}
                      <td className="py-4 px-5">
                        <div className="font-mono text-[10px] font-bold text-nex-blueLight">{e.reference_id || e.id}</div>
                        <div className="font-semibold text-white mt-0.5">{e.customer_name}</div>
                        <div className="text-[10px] text-nex-mist">{e.phone} • {e.city || "Bengaluru"}</div>
                        {e.email && <div className="text-[9px] text-white/40">{e.email}</div>}
                      </td>

                      {/* Requirement & Budget */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">{e.laptop_type || "Laptop Enquiry"}</div>
                        <div className="text-[10px] text-amber-300 font-bold mt-0.5">Budget: {e.budget || "Unspecified"}</div>
                        <div className="text-[10px] text-nex-mist mt-1 line-clamp-2 max-w-[220px]">
                          {e.requirements || e.message || "No notes"}
                        </div>
                      </td>

                      {/* Specs Needed */}
                      <td className="py-4 px-4 text-[10px] space-y-0.5 text-nex-mist">
                        <div><span className="text-white/40">Brand:</span> {e.brand_preference || "Any"}</div>
                        <div><span className="text-white/40">CPU/RAM:</span> {e.processor_preference || "Any"} / {e.ram_preference || "Any"}</div>
                        <div><span className="text-white/40">GPU:</span> {e.gpu_preference || "Any"}</div>
                      </td>

                      {/* Status & Date */}
                      <td className="py-4 px-4">
                        <select
                          value={e.status}
                          onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase bg-nex-black border border-white/10 focus:outline-none cursor-pointer ${statusCfg.color.split(" ")[0]}`}
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <div className="text-[9px] text-white/30 mt-1">{new Date(e.created_at).toLocaleDateString("en-IN")}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenDetail(e)}
                          className="h-8 px-2.5 rounded-lg bg-nex-blue/10 border border-nex-blue/20 hover:bg-nex-blue/20 text-nex-blueLight text-[10px] font-bold inline-flex items-center gap-1"
                          title="View Details & Recommend Laptops"
                        >
                          <Eye className="h-3.5 w-3.5" /> Details
                        </button>
                        <a
                          href={`tel:${e.phone}`}
                          className="h-8 w-8 rounded-full bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center inline-flex text-green-400"
                          title="Call Customer"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/${(e.phone || "").replace(/\D/g, "")}?text=${waText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 w-8 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center inline-flex text-[#25D366]"
                          title="Open WhatsApp Prefilled Message"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="h-8 w-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center inline-flex text-red-400"
                          title="Delete Enquiry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enquiry Details & Recommendation Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => !savingEnquiry && setSelectedEnquiry(null)} />

          <div className="glass-panel relative w-full max-w-3xl overflow-y-auto max-h-[90vh] rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue sm:p-8 z-10">
            <button
              onClick={() => !savingEnquiry && setSelectedEnquiry(null)}
              className="absolute right-4 top-4 text-white/50 hover:text-white z-10"
              disabled={savingEnquiry}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="h-10 w-10 rounded-xl bg-nex-blue/10 border border-nex-blue/20 text-nex-blueLight flex items-center justify-center shrink-0">
                <Laptop className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-white">Laptop Enquiry Details</h3>
                  <span className="font-mono text-xs font-bold text-nex-blueLight bg-nex-blue/10 px-2 py-0.5 rounded border border-nex-blue/20">
                    {selectedEnquiry.reference_id || selectedEnquiry.id}
                  </span>
                </div>
                <p className="text-xs text-nex-mist mt-0.5">Submitted on {new Date(selectedEnquiry.created_at).toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="space-y-6 text-xs">
              
              {/* Customer Profile Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="text-[10px] text-nex-mist uppercase block">Customer Name</span>
                  <span className="font-bold text-white text-sm">{selectedEnquiry.customer_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-nex-mist uppercase block">Contact Phone</span>
                  <span className="font-bold text-white">{selectedEnquiry.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-nex-mist uppercase block">Location / City</span>
                  <span className="font-bold text-white">{selectedEnquiry.city || "Not specified"}</span>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-nex-blueLight">Requested Specifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-nex-black/60 p-4 rounded-xl border border-white/5">
                  <div>
                    <span className="text-[10px] text-nex-mist block">Laptop Category</span>
                    <span className="font-bold text-white">{selectedEnquiry.laptop_type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-nex-mist block">Budget Range</span>
                    <span className="font-bold text-amber-300">{selectedEnquiry.budget}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-nex-mist block">Preferred Brand</span>
                    <span className="font-bold text-white">{selectedEnquiry.brand_preference || "Any"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-nex-mist block">Processor</span>
                    <span className="font-bold text-white">{selectedEnquiry.processor_preference || "Any"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-nex-mist block">RAM Size</span>
                    <span className="font-bold text-white">{selectedEnquiry.ram_preference || "Any"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-nex-mist block">Storage Capacity</span>
                    <span className="font-bold text-white">{selectedEnquiry.storage_preference || "Any"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-nex-mist block">GPU Requirement</span>
                    <span className="font-bold text-white">{selectedEnquiry.gpu_preference || "Any"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-nex-mist block">Condition</span>
                    <span className="font-bold text-white">{selectedEnquiry.condition || "Any"}</span>
                  </div>
                </div>

                {selectedEnquiry.requirements && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-nex-mist uppercase block font-bold">Additional Customer Notes:</span>
                    <p className="text-xs text-white/90 mt-1 italic">&ldquo;{selectedEnquiry.requirements}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div className="space-y-1">
                <label className="text-xs text-white/80 font-semibold block">Workflow Status</label>
                <select
                  value={selectedEnquiry.status}
                  onChange={(ev) => setSelectedEnquiry((prev: any) => ({ ...prev, status: ev.target.value }))}
                  className="w-full sm:w-64 rounded-xl bg-nex-black border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none font-bold"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Recommended Laptops Section */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider text-nex-blueLight">Recommended Laptops from Catalog</h4>
                    <p className="text-[11px] text-nex-mist mt-0.5">Customer will be able to see these recommended products on their tracking portal.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProductSelectorModal(true)}
                    className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Recommend Product
                  </button>
                </div>

                {recommendedProductsList.length === 0 ? (
                  <div className="p-4 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/10 text-nex-mist text-[11px]">
                    No laptops recommended yet. Click &quot;+ Recommend Product&quot; to select options from the catalog.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendedProductsList.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-white/5 p-1 flex items-center justify-center shrink-0 border border-white/5">
                            <img src={getSafeImageSrc(p.image)} alt={p.title} className="object-contain max-h-full max-w-full" />
                          </div>
                          <div>
                            <div className="font-bold text-white truncate max-w-[150px]">{p.title}</div>
                            <div className="text-[11px] text-nex-blueLight font-semibold">Rs. {(p.price ?? 0).toLocaleString("en-IN")}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleRecommendProduct(p)}
                          className="text-red-400 hover:text-white p-1"
                          title="Remove recommendation"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer-Facing Reply Message */}
              <div className="space-y-1 border-t border-white/10 pt-4">
                <label className="text-xs text-white/90 font-bold block">
                  Customer-Facing Message / Proposal (Public on Track Page)
                </label>
                <textarea
                  value={customerReplyText}
                  onChange={(ev) => setCustomerReplyText(ev.target.value)}
                  placeholder="e.g. We found 2 laptops matching your budget. Check recommended products below or call us for special discount."
                  rows={2}
                  className="w-full rounded-xl bg-nex-black border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Admin Internal Notes */}
              <div className="space-y-1">
                <label className="text-xs text-amber-300 font-bold block flex items-center gap-1">
                  <span>Internal Admin Notes (PRIVATE - Admin Only)</span>
                </label>
                <textarea
                  value={adminNotesText}
                  onChange={(ev) => setAdminNotesText(ev.target.value)}
                  placeholder="Private internal notes (e.g. Called customer on 31st July, wants Lenovo ThinkPad with 16GB RAM)..."
                  rows={2}
                  className="w-full rounded-xl bg-white/[0.03] border border-amber-500/20 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="btn-secondary !py-2 !px-4"
                  disabled={savingEnquiry}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDetailModal}
                  disabled={savingEnquiry}
                  className="btn-primary !py-2 !px-6 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {savingEnquiry ? "Saving Changes..." : "Save Enquiry Details"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Product Catalog Selector Modal */}
      {showProductSelectorModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setShowProductSelectorModal(false)} />

          <div className="glass-panel relative w-full max-w-xl overflow-y-auto max-h-[80vh] rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue sm:p-8 z-10 space-y-4">
            <button
              onClick={() => setShowProductSelectorModal(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="font-display text-base font-bold text-white">Select Laptops to Recommend</h3>
              <p className="text-xs text-nex-mist mt-0.5">Click any catalog product to add/remove recommendation for this customer.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {productsCatalog.map((prod) => {
                const isSelected = recommendedProductsList.some((p) => p.id === prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleToggleRecommendProduct(prod)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-nex-blueLight bg-nex-blue/20 ring-1 ring-nex-blueLight/50"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg overflow-hidden bg-white/5 p-1 flex items-center justify-center shrink-0 border border-white/5">
                        <img src={getSafeImageSrc(prod.image)} alt={prod.title} className="object-contain max-h-full max-w-full" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs truncate max-w-[130px]">{prod.title}</div>
                        <div className="text-[10px] text-nex-mist">Rs. {(prod.price ?? 0).toLocaleString("en-IN")}</div>
                      </div>
                    </div>

                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${isSelected ? "bg-nex-blue border-nex-blue text-white" : "border-white/20"}`}>
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowProductSelectorModal(false)}
                className="btn-primary !py-2 !px-5 text-xs"
              >
                Done Selecting ({recommendedProductsList.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminLaptopEnquiriesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white text-xs font-semibold">Loading Laptop Enquiries...</div>}>
      <LaptopEnquiriesContent />
    </Suspense>
  );
}
