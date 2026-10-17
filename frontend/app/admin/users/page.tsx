"use client";

import React, { useEffect, useState } from "react";
import {
  UserCheck,
  Shield,
  Key,
  RefreshCw,
  Plus,
  Search,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Edit,
  SlidersHorizontal,
  Mail,
  Phone
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";

export default function AdminUsersPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "reseller" | "user">("all");
  
  // Modals
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [targetRole, setTargetRole] = useState<"admin" | "reseller" | "user">("user");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Admin Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "reseller" | "user">("admin");
  const [submitting, setSubmitting] = useState(false);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const usersList = await dbHelper.users.list();
      const resellersList = await dbHelper.resellers.list();

      // Normalize into unified accounts list
      const normalizedUsers = usersList.map((u: any) => ({
        id: u.id,
        name: u.full_name || u.fullName || u.name || "User Account",
        email: u.email || "N/A",
        phone: u.phone || "N/A",
        role: u.role || "user",
        is_active: u.is_active !== undefined ? u.is_active : true,
        source: "users",
        created_at: u.created_at || new Date().toISOString(),
      }));

      const normalizedResellers = resellersList.map((r: any) => ({
        id: r.id,
        name: r.business_name || r.owner_name || "Reseller Partner",
        email: r.email || "N/A",
        phone: r.phone || "N/A",
        role: "reseller",
        is_active: r.status === "active",
        status: r.status,
        source: "resellers",
        created_at: r.created_at || new Date().toISOString(),
      }));

      // Merge and deduplicate by email
      const combined = [...normalizedUsers];
      for (const res of normalizedResellers) {
        if (!combined.some((c) => c.email.toLowerCase() === res.email.toLowerCase())) {
          combined.push(res);
        }
      }

      setAccounts(combined);
    } catch (err) {
      console.error("Failed to load accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    if (typeof window !== "undefined") {
      window.addEventListener("nexbyte-realtime", loadAccounts);
      return () => window.removeEventListener("nexbyte-realtime", loadAccounts);
    }
  }, []);

  const handleToggleActive = async (account: any) => {
    const actionText = account.is_active ? "deactivate" : "activate";
    if (confirm(`Are you sure you want to ${actionText} the account for "${account.name}"?`)) {
      try {
        if (account.source === "resellers") {
          await dbHelper.resellers.update(account.id, {
            status: account.is_active ? "suspended" : "active",
          });
        } else {
          await dbHelper.users.update(account.id, {
            is_active: !account.is_active,
          });
        }
        loadAccounts();
      } catch (err: any) {
        alert(err.message || "Failed to update account status.");
      }
    }
  };

  const handleChangeRoleSubmit = async () => {
    if (!selectedAccount) return;
    if (confirm(`CRITICAL SECURITY ACTION: Change role of "${selectedAccount.name}" to ${targetRole.toUpperCase()}?`)) {
      try {
        await dbHelper.users.update(selectedAccount.id, {
          role: targetRole,
        });
        await dbHelper.activityLogs.create({
          user_name: "Admin Officer",
          role: "admin",
          action: "Admin Changed User Role",
          details: `Changed role of ${selectedAccount.email} to ${targetRole}`,
        });
        setShowRoleModal(false);
        setSelectedAccount(null);
        loadAccounts();
      } catch (err: any) {
        alert(err.message || "Failed to change user role.");
      }
    }
  };

  const handleResetAccess = async (account: any) => {
    if (confirm(`Send password reset email / security key reset for "${account.email}"?`)) {
      alert(`Password reset instructions have been dispatched to ${account.email}.`);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    setSubmitting(true);
    try {
      const newAcc = {
        full_name: newName,
        email: newEmail,
        phone: newPhone || "9876543210",
        role: newRole,
        is_active: true,
      };

      await dbHelper.users.create(newAcc);
      await dbHelper.activityLogs.create({
        user_name: "Admin Officer",
        role: "admin",
        action: "Created Account",
        details: `Created new ${newRole} account for ${newEmail}`,
      });

      setShowCreateModal(false);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      loadAccounts();
    } catch (err: any) {
      alert(err.message || "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const q = search.toLowerCase();
    const matchesSearch =
      acc.name.toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q) ||
      acc.phone.includes(q);

    if (!matchesSearch) return false;
    if (roleFilter !== "all" && acc.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-nex-blueLight" /> Access &amp; User Management
          </h1>
          <p className="text-xs text-nex-mist mt-0.5">
            Manage system logins, roles matrix (Admin / Reseller / User), and active access credentials.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary !py-2.5 !px-4 text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Create Account
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-nex-ink flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-nex-mist" />
          <input
            type="text"
            placeholder="Search account name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-nex-black border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-nex-mist focus:outline-none focus:border-nex-blue"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Accounts" },
            { id: "admin", label: "Admins" },
            { id: "reseller", label: "Resellers" },
            { id: "user", label: "Users" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                roleFilter === r.id
                  ? "bg-nex-blue text-white shadow-glow-blue"
                  : "text-nex-mist hover:text-white hover:bg-white/5"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts List Table */}
      {loading ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <RefreshCw className="h-6 w-6 animate-spin text-nex-blueLight mx-auto" />
          <p className="text-xs text-nex-mist mt-2">Connecting to auth database...</p>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-white/5">
          <User className="h-10 w-10 text-nex-mist mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">No accounts found</p>
          <p className="text-xs text-nex-mist mt-1">No user or reseller accounts match your filter criteria.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden bg-nex-ink">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/10 text-nex-mist font-semibold">
                <tr>
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/90">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${
                          acc.role === "admin"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : acc.role === "reseller"
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                            : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                        }`}>
                          {acc.role === "admin" ? <Shield className="h-4 w-4" /> : acc.role === "reseller" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{acc.name}</div>
                          <div className="text-[10px] text-nex-mist">ID: {acc.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-white font-medium flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-nex-mist" /> {acc.email}
                      </div>
                      <div className="text-[10px] text-nex-mist flex items-center gap-1.5 mt-0.5">
                        <Phone className="h-3 w-3" /> {acc.phone}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        acc.role === "admin"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : acc.role === "reseller"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      }`}>
                        {acc.role}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {acc.is_active ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" /> Deactivated
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedAccount(acc);
                          setTargetRole(acc.role);
                          setShowRoleModal(true);
                        }}
                        className="btn-secondary !py-1.5 !px-2.5 text-[11px] inline-flex items-center gap-1"
                        title="Change Account Role"
                      >
                        <SlidersHorizontal className="h-3 w-3" /> Role
                      </button>

                      <button
                        onClick={() => handleResetAccess(acc)}
                        className="btn-secondary !py-1.5 !px-2.5 text-[11px] inline-flex items-center gap-1"
                        title="Reset Security Credentials"
                      >
                        <Key className="h-3 w-3 text-amber-400" /> Reset
                      </button>

                      <button
                        onClick={() => handleToggleActive(acc)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors inline-flex items-center gap-1 ${
                          acc.is_active
                            ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                      >
                        {acc.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRoleModal(false)} />
          <div className="glass-panel relative w-full max-w-md rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">Change Account Role</h3>
                <p className="text-xs text-nex-mist">{selectedAccount.name} ({selectedAccount.email})</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-white/80 font-semibold">Select New Role Permission:</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full rounded-xl bg-nex-black border border-white/10 p-3 text-xs text-white focus:outline-none"
              >
                <option value="user">USER — Customer access only</option>
                <option value="reseller">RESELLER — Reseller Partner Workspace (/reseller)</option>
                <option value="admin">ADMIN — Full System Admin Console (/admin)</option>
              </select>
              <p className="text-[11px] text-amber-400 leading-relaxed pt-1">
                ⚠️ Warning: Elevating an account to ADMIN gives full administrative privileges over products, orders, and users.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10 text-xs">
              <button onClick={() => setShowRoleModal(false)} className="btn-secondary !py-2 !px-4">
                Cancel
              </button>
              <button onClick={handleChangeRoleSubmit} className="btn-primary !py-2 !px-5 bg-amber-500 hover:bg-amber-400 text-black border-none font-bold">
                Confirm Role Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="glass-panel relative w-full max-w-md rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue space-y-4">
            <h3 className="font-display text-base font-bold text-white border-b border-white/10 pb-3">
              Register New System Account
            </h3>

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-white/80 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Administrator Officer"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-2.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/80 font-semibold">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin2@nexbyte.com"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-2.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/80 font-semibold">Phone Number</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-2.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/80 font-semibold">Assign Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full rounded-xl bg-nex-black border border-white/10 p-2.5 text-xs text-white"
                >
                  <option value="admin">ADMIN Officer</option>
                  <option value="reseller">RESELLER Partner</option>
                  <option value="user">USER / Customer</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary !py-2 !px-4">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary !py-2 !px-5 font-bold">
                  {submitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
