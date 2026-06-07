import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  change,
  trend = "neutral",
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="enterprise-card flex min-w-0 flex-col justify-between p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="type-label min-w-0 truncate">{label}</p>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
            <Icon className="h-[1.125rem] w-[1.125rem]" />
          </div>
        )}
      </div>
      <p className="type-kpi-value mt-3 truncate">{value}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {change && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-2xs font-semibold",
              trend === "up" && "bg-emerald-50 text-emerald-700",
              trend === "down" && "bg-red-50 text-red-600",
              trend === "neutral" && "bg-slate-100 text-slate-600",
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {change}
          </span>
        )}
        {sub && <span className="type-caption">{sub}</span>}
      </div>
    </div>
  );
}
