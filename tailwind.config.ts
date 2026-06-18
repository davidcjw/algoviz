import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paper surfaces (light editorial). DEFAULT = page; higher steps = more contrast wells.
        ink: {
          DEFAULT: "#FAF8F3", // page — warm paper
          900: "#F1ECE2", // gentle inset / canvas
          800: "#ECE6DA",
          700: "#E5DECF",
          600: "#DBD3C1",
          500: "#CFC5B0",
        },
        coal: "#161A22", // primary ink text / strong emphasis
        brand: {
          DEFAULT: "#1F3A5F", // single editorial accent — ink-blue
          soft: "#2B4E78",
          deep: "#15314F",
        },
        line: "rgba(22, 26, 34, 0.12)", // dark hairline on paper
        // Pillar accents — muted, editorial (read as ink tags, not neon)
        ds: {
          DEFAULT: "#0F766E", // teal — data structures
          soft: "#14B8A6",
          deep: "#0B5A54",
        },
        algo: {
          DEFAULT: "#4D7C0F", // olive — algorithms
          soft: "#65A30D",
          deep: "#3F6212",
        },
        sys: {
          DEFAULT: "#B45309", // ochre — system design
          soft: "#D97706",
          deep: "#92400E",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      maxWidth: {
        content: "1200px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "grid-pan": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "40px 40px" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "grid-pan": "grid-pan 20s linear infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
