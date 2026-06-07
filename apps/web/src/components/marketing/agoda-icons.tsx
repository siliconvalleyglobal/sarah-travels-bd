import { AGODA_BLUE } from "./agoda-shared";

const INACTIVE = "#9ca3af";

export function AgodaTabIcon({ id, active }: { id: string; active: boolean }) {
  const color = active ? AGODA_BLUE : INACTIVE;

  switch (id) {
    case "hotels":
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 10.5V20h4v-6h4v6h4V10.5L12 5 3 10.5z" stroke={color} strokeWidth="1.5" fill={active ? "rgba(34,131,223,0.12)" : "none"} />
          <path d="M9 14h2M13 14h2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "homes":
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5z" stroke={color} strokeWidth="1.5" fill={active ? "rgba(34,131,223,0.12)" : "none"} />
        </svg>
      );
    case "flight-hotel":
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="8" width="10" height="10" rx="1" stroke={color} strokeWidth="1.5" fill={active ? "rgba(34,131,223,0.12)" : "none"} />
          <path d="M14 12h6l-1.5 2H14v-2z" fill={color} />
          <path d="M16 10l4-2-1 2 1 2-4-2" stroke={color} strokeWidth="1.2" fill="none" />
        </svg>
      );
    case "flights":
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 12h3l2.5-5 3 10 2.5-5H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case "activities":
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" fill={active ? "rgba(34,131,223,0.12)" : "none"} />
          <path d="M8 12h8M12 8v8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "transfers":
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="2" y="9" width="14" height="8" rx="1.5" stroke={color} strokeWidth="1.5" fill={active ? "rgba(34,131,223,0.12)" : "none"} />
          <circle cx="6" cy="18" r="2" stroke={color} strokeWidth="1.5" />
          <circle cx="14" cy="18" r="2" stroke={color} strokeWidth="1.5" />
          <path d="M16 12h6v4h-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
