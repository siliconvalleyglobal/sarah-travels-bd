"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/lib/dashboard-demo-data";

function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`enterprise-card ${className ?? ""}`}>
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="type-section-title">{title}</h3>
        {subtitle && <p className="type-caption mt-1">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  fontSize: 12,
};

export function RevenueAreaChart({
  data,
  title = "Revenue Trend",
  subtitle = "Monthly gross revenue (৳ Lakh)",
}: {
  data: { month: string; revenue: number; bookings?: number }[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.gold} stopOpacity={0.35} />
              <stop offset="100%" stopColor={CHART_COLORS.gold} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.gold} fill="url(#revGrad)" strokeWidth={2} name="Revenue (L)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function StackedBarChart({
  data,
  keys,
  colors,
  title,
  subtitle,
}: {
  data: Record<string, string | number>[];
  keys: string[];
  colors: string[];
  title: string;
  subtitle?: string;
}) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey={Object.keys(data[0] ?? {}).find((k) => k === "week" || k === "month") ?? "week"} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {keys.map((key, i) => (
            <Bar key={key} dataKey={key} stackId="a" fill={colors[i]} radius={i === keys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DonutChart({
  data,
  title,
  subtitle,
}: {
  data: { name: string; value: number; color: string }[];
  title: string;
  subtitle?: string;
}) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="value">
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function LineChartCard({
  data,
  dataKey,
  title,
  subtitle,
  color = CHART_COLORS.navy,
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  title: string;
  subtitle?: string;
  color?: string;
}) {
  const xKey = Object.keys(data[0] ?? {}).find((k) => k !== dataKey) ?? "month";
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
