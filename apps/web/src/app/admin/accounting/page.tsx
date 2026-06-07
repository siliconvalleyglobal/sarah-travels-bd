"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface LedgerEntry {
  id: string;
  debit: number;
  credit: number;
  description: string;
  entryDate: string;
  account: { code: string; name: string };
}

export default function AdminAccountingPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [pnl, setPnl] = useState<{ revenue: number; expenses: number; netProfit: number } | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { window.location.href = "/login"; return; }

    api<Account[]>("/accounting/accounts", { token }).then(setAccounts);
    api<LedgerEntry[]>("/accounting/ledger", { token }).then(setLedger);

    const from = new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];
    const to = new Date().toISOString().split("T")[0];
    api<{ revenue: number; expenses: number; netProfit: number }>(
      `/accounting/profit-loss?from=${from}&to=${to}`,
      { token },
    ).then(setPnl);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold">Accounting</h2>
      <p className="mt-1 text-gray-600">Chart of accounts, ledger, and profit & loss.</p>

      {pnl && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Revenue (YTD)</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(pnl.revenue)}</p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Expenses (YTD)</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(pnl.expenses)}</p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Net Profit (YTD)</p>
            <p className="text-xl font-bold">{formatCurrency(pnl.netProfit)}</p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h3 className="font-semibold">Chart of Accounts</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="px-4 py-2 font-mono text-xs">{a.code}</td>
                    <td className="px-4 py-2">{a.name}</td>
                    <td className="px-4 py-2 text-gray-500">{a.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h3 className="font-semibold">Recent Ledger Entries</h3>
          </div>
          {ledger.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">No ledger entries yet</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-2">Account</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2 text-right">Debit</th>
                    <th className="px-4 py-2 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((e) => (
                    <tr key={e.id} className="border-b">
                      <td className="px-4 py-2">{e.account.code}</td>
                      <td className="px-4 py-2 text-gray-600">{e.description}</td>
                      <td className="px-4 py-2 text-right">{Number(e.debit) > 0 ? formatCurrency(Number(e.debit)) : "—"}</td>
                      <td className="px-4 py-2 text-right">{Number(e.credit) > 0 ? formatCurrency(Number(e.credit)) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
