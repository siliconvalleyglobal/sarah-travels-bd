"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plane, Shield, ArrowRight, Lock } from "lucide-react";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { SarahLogo } from "@/components/SarahLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{ accessToken: string; user: { role: string } }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) },
      );
      setToken(data.accessToken);
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      if (redirect?.startsWith("/admin") && (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN")) {
        router.push(redirect);
      } else if (data.user.role === "AGENT" || data.user.role === "SUB_AGENT") {
        router.push("/agent/dashboard");
      } else if (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 hero-mesh lg:flex lg:flex-col lg:justify-between lg:p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-brand-navy/80" />
        <div className="relative z-10 flex flex-col justify-between h-full">
        <Link href="/"><SarahLogo /></Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md"
        >
          <h2 className="font-display text-4xl font-extrabold text-white leading-tight">
            Your journey starts with <span className="gradient-text">trust</span>
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            Access flights, hotels, visa applications, Umrah packages, and all your bookings in one secure portal.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {[
              { icon: Plane, text: "Book flights, hotels & tours" },
              { icon: Shield, text: "NBR-compliant transparent pricing" },
              { icon: Lock, text: "Secure account & booking history" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm text-white/80">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/15">
                  <item.icon className="h-4 w-4 text-brand-gold" />
                </div>
                {item.text}
              </div>
            ))}
          </div>
        </motion.div>
        <p className="text-xs text-white/30">Demo: customer@travel.com · admin@travel.com · password123</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Link href="/"><SarahLogo /></Link>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-elevated">
            <h1 className="font-display text-2xl font-extrabold text-brand-navy">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to manage your bookings</p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} size="lg" className="w-full">
                {loading ? <Spinner /> : null}
                Sign In
                <ArrowRight data-icon="inline-end" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              No account?{" "}
              <Link href="/register" className="font-bold text-brand-navy hover:text-brand-gold transition">
                Create one free
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400 lg:hidden">
            Demo: customer@travel.com · admin@travel.com · password123
          </p>
        </motion.div>
      </div>
    </div>
  );
}
