export function DashboardHeader({
  title,
  subtitle,
  badge,
  actions,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="type-page-title break-words">{title}</h1>
          {badge && (
            <span className="type-badge border-brand-gold/30 bg-brand-gold/10 text-brand-gold">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="type-lead mt-2 max-w-xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
