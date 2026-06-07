interface LogoMarkProps {
  className?: string;
  wingFill?: string;
  bodyFill?: string;
}

/** Sarah Travels geometric logomark (gold wing + navy/white body). */
export function LogoMark({
  className = "h-7 w-7 shrink-0",
  wingFill = "#D4AF37",
  bodyFill = "currentColor",
}: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path d="M15 35 H40 L22 75 H5 L15 35 Z" fill={wingFill} />
      <path d="M35 25 H85 L60 75 H40 L57 37 H35 V25 Z" fill={bodyFill} />
    </svg>
  );
}
