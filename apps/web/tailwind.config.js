/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.04em" }],
        caption: ["0.75rem", { lineHeight: "1.125rem" }],
        body: ["0.9375rem", { lineHeight: "1.6" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.65" }],
        "title-sm": ["1.125rem", { lineHeight: "1.4", letterSpacing: "-0.015em" }],
        "title-md": ["1.375rem", { lineHeight: "1.35", letterSpacing: "-0.02em" }],
        "title-lg": ["1.625rem", { lineHeight: "1.25", letterSpacing: "-0.025em" }],
        "title-xl": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.03em" }],
      },
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          900: "#1e3a8a",
          navy: "#02132F",
          "navy-light": "#0a2a5e",
          royal: "#0047AB",
          gold: "#D4AF37",
          "gold-light": "#E8C96A",
          dark: "#1A1A1A",
          gray: "#F4F4F4",
        },
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(2, 19, 47, 0.08), 0 4px 6px -4px rgba(2, 19, 47, 0.05)",
        elevated: "0 20px 50px -12px rgba(2, 19, 47, 0.18)",
        glow: "0 0 40px -8px rgba(212, 175, 55, 0.45)",
        "inner-glow": "inset 0 1px 0 0 rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-pattern":
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        "mesh-gradient":
          "radial-gradient(at 40% 20%, rgba(212,175,55,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(0,71,171,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(212,175,55,0.08) 0px, transparent 50%)",
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        shimmer: "shimmer 3s infinite linear",
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
