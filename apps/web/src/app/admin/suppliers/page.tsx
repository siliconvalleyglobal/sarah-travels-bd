"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Supplier {
  id: string;
  name: string;
  type: string;
  code: string;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
}

const supplierTypes = ["AIRLINE", "CONSOLIDATOR", "HOTEL", "VISA_PARTNER"];

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "AIRLINE", code: "", contactEmail: "", contactPhone: "",
  });

  function load() {
    const token = getToken();
    if (!token) { window.location.href = "/login"; return; }
    api<Supplier[]>("/admin/suppliers", { token })
      .then(setSuppliers)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load suppliers"));
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    await api("/admin/suppliers", {
      method: "POST",
      token,
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ name: "", type: "AIRLINE", code: "", contactEmail: "", contactPhone: "" });
    load();
  }

  async function toggleActive(id: string, isActive: boolean) {
    const token = getToken();
    if (!token) return;
    await api(`/admin/suppliers/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ isActive: !isActive }),
    });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="type-page-title">Suppliers</h2>
          <p className="type-lead mt-2">Manage airlines, consolidators, and visa partners.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
        >
          {showForm ? "Cancel" : "Add Supplier"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" required />
            </div>
            <div>
              <label className="text-sm font-medium">Code</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="mt-1 w-full rounded-lg border px-3 py-2" required />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2">
                {supplierTypes.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-brand-600 px-6 py-2 text-sm text-white">
            Create Supplier
          </button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{s.code}</td>
                <td className="px-4 py-3">{s.type.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 text-gray-500">{s.contactEmail ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${
                    s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(s.id, s.isActive)}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    {s.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
