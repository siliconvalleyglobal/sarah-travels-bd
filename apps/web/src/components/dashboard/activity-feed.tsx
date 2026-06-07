import { Activity } from "lucide-react";

export function ActivityFeed({
  title,
  items,
}: {
  title: string;
  items: { action: string; user: string; time: string }[];
}) {
  return (
    <div className="enterprise-card">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
        <Activity className="h-4 w-4 text-brand-gold" strokeWidth={2} />
        <h3 className="type-section-title">{title}</h3>
      </div>
      <ul className="divide-y divide-slate-50">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 px-5 py-4">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" />
            <div className="min-w-0 flex-1">
              <p className="type-body text-[0.875rem]">{item.action}</p>
              <p className="type-caption mt-1">
                {item.user} · {item.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
