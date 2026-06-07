"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

interface Agent {
  id: string;
  agencyName: string;
  agencyCode: string;
  creditLimit: number;
  creditUsed: number;
  depositBalance: number;
  commissionRate: number;
  isApproved: boolean;
  user: { firstName: string; lastName: string; email: string; phone: string | null };
  _count: { bookings: number; subAgents: number };
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ creditLimit: 0, commissionRate: 0, isApproved: false });

  function load() {
    const token = getToken();
    if (!token) { window.location.href = "/login"; return; }
    api<Agent[]>("/admin/agents", { token }).then(setAgents);
  }

  useEffect(() => { load(); }, []);

  function startEdit(agent: Agent) {
    setEditing(agent.id);
    setForm({
      creditLimit: Number(agent.creditLimit),
      commissionRate: Number(agent.commissionRate),
      isApproved: agent.isApproved,
    });
  }

  async function save(id: string) {
    const token = getToken();
    if (!token) return;
    await api(`/admin/agents/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(form),
    });
    setEditing(null);
    load();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Agents</h2>
      <p className="mt-1 text-gray-600">Approve agents and manage credit limits.</p>

      <div className="mt-6 space-y-4">
        {agents.length === 0 ? (
          <p className="text-gray-500">No agents registered yet.</p>
        ) : (
          agents.map((agent) => (
            <div key={agent.id} className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{agent.agencyName}</h3>
                  <p className="text-sm text-gray-500">{agent.agencyCode} · {agent.user.email}</p>
                  <p className="text-sm text-gray-500">
                    {agent.user.firstName} {agent.user.lastName}
                    {agent.user.phone && ` · ${agent.user.phone}`}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  agent.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {agent.isApproved ? "Approved" : "Pending"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">Credit Limit</p>
                  <p className="font-medium">{formatCurrency(Number(agent.creditLimit))}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Credit Used</p>
                  <p className="font-medium">{formatCurrency(Number(agent.creditUsed))}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Deposit</p>
                  <p className="font-medium">{formatCurrency(Number(agent.depositBalance))}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bookings</p>
                  <p className="font-medium">{agent._count.bookings}</p>
                </div>
              </div>

              {editing === agent.id ? (
                <div className="mt-4 flex flex-wrap items-end gap-4 border-t pt-4">
                  <div>
                    <label className="text-xs text-gray-500">Credit Limit</label>
                    <input
                      type="number"
                      value={form.creditLimit}
                      onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })}
                      className="mt-1 block rounded border px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Commission %</label>
                    <input
                      type="number"
                      value={form.commissionRate}
                      onChange={(e) => setForm({ ...form, commissionRate: Number(e.target.value) })}
                      className="mt-1 block rounded border px-3 py-1.5 text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isApproved}
                      onChange={(e) => setForm({ ...form, isApproved: e.target.checked })}
                    />
                    Approved
                  </label>
                  <button onClick={() => save(agent.id)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">
                    Save
                  </button>
                  <button onClick={() => setEditing(null)} className="text-sm text-gray-500">Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(agent)}
                  className="mt-4 text-sm text-brand-600 hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
