"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

interface Wallet {
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
  depositBalance: number;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    description: string | null;
    createdAt: string;
  }>;
}

export default function AgentWalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { window.location.href = "/login"; return; }
    api<Wallet>("/agents/wallet", { token }).then(setWallet);
  }, []);

  if (!wallet) return <p className="text-gray-500">Loading wallet...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold">Wallet</h2>
      <p className="mt-1 text-gray-600">Credit limit, deposits, and transaction history.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Credit Limit" value={formatCurrency(Number(wallet.creditLimit))} />
        <StatCard label="Credit Used" value={formatCurrency(Number(wallet.creditUsed))} />
        <StatCard label="Credit Available" value={formatCurrency(wallet.creditAvailable)} highlight />
        <StatCard label="Deposit Balance" value={formatCurrency(Number(wallet.depositBalance))} />
      </div>

      <div className="mt-8 rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold">Transaction History</h3>
        </div>
        {wallet.transactions.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-500">No transactions yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {wallet.transactions.map((tx) => (
                <tr key={tx.id} className="border-b last:border-0">
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">{tx.type.replace(/_/g, " ")}</td>
                  <td className="px-6 py-3">{tx.description ?? "—"}</td>
                  <td className={`px-6 py-3 text-right font-medium ${
                    Number(tx.amount) < 0 ? "text-red-600" : "text-green-600"
                  }`}>
                    {Number(tx.amount) > 0 ? "+" : ""}{formatCurrency(Number(tx.amount))}
                  </td>
                  <td className="px-6 py-3 text-right">{formatCurrency(Number(tx.balanceAfter))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${highlight ? "border-brand-200 bg-brand-50" : "bg-white"}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
