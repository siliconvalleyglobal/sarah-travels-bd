export function DataTable({
  title,
  subtitle,
  columns,
  rows,
}: {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="enterprise-card overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="type-section-title">{title}</h3>
        {subtitle && <p className="type-caption mt-1">{subtitle}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="enterprise-table w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/90">
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/60">
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    TICKETED: "border-emerald-200/80 bg-emerald-50 text-emerald-800",
    CONFIRMED: "border-blue-200/80 bg-blue-50 text-blue-800",
    PROCESSING: "border-amber-200/80 bg-amber-50 text-amber-800",
    PENDING_PAYMENT: "border-orange-200/80 bg-orange-50 text-orange-800",
    CANCELLED: "border-red-200/80 bg-red-50 text-red-700",
  };
  return (
    <span className={`type-badge ${colors[status] ?? "border-slate-200 bg-slate-100 text-slate-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
