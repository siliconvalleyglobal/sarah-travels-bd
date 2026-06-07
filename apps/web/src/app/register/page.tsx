"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Building2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { SarahLogo } from "@/components/SarahLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAgent = searchParams.get("role") === "agent";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    agencyName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{ accessToken: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          role: isAgent ? "AGENT" : "CUSTOMER",
          ...(isAgent && form.agencyName ? { agencyName: form.agencyName } : {}),
        }),
      });
      setToken(data.accessToken);
      router.push(isAgent ? "/agent/dashboard" : "/account/bookings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 hero-mesh lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/"><SarahLogo /></Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md"
        >
          <h2 className="font-display text-4xl font-extrabold text-white leading-tight">
            {isAgent ? "Grow your agency" : "Join thousands of travelers"}
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            {isAgent
              ? "Register as a B2B agent to access wholesale rates, wallet credits, and commission tracking."
              : "Create a free account to book flights, hotels, visas, Umrah packages, tours and car rentals."}
          </p>
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
            {isAgent ? <Building2 className="h-8 w-8 text-brand-gold" /> : <Users className="h-8 w-8 text-brand-gold" />}
            <div>
              <p className="text-sm font-bold text-white">{isAgent ? "B2B Agent Account" : "Customer Account"}</p>
              <p className="text-xs text-white/50">Free registration · Instant access</p>
            </div>
          </div>
        </motion.div>
        <Link href={isAgent ? "/register" : "/register?role=agent"} className="text-xs text-brand-gold hover:underline">
          {isAgent ? "Register as customer instead →" : "Register as travel agent →"}
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden"><Link href="/"><SarahLogo /></Link></div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-elevated">
            <h1 className="font-display text-2xl font-extrabold text-brand-navy">
              {isAgent ? "Agent Registration" : "Create Account"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">Fill in your details to get started</p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+880" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required />
              </div>
              {isAgent && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="agency">Agency Name</Label>
                  <Input id="agency" value={form.agencyName} onChange={(e) => setForm({ ...form, agencyName: e.target.value })} placeholder="Your Travel Agency" />
                </div>
              )}
              <Button type="submit" disabled={loading} size="lg" className="w-full mt-2">
                {loading ? <Spinner /> : null}
                Register
                <ArrowRight data-icon="inline-end" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-brand-navy hover:text-brand-gold transition">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
