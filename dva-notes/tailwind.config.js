/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        glass: {
          50: "rgba(255,255,255,0.05)",
          100: "rgba(255,255,255,0.08)",
          200: "rgba(255,255,255,0.12)",
          300: "rgba(255,255,255,0.18)",
        },
        ink: {
          950: "#05060a",
          900: "#0a0c14",
          800: "#10131e",
        },
        aws: {
          orange: "#ff9900",
          dark: "#232f3e",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "Menlo", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass:
          "0 8px 32px 0 rgba(0,0,0,0.45), inset 0 1px 0 0 rgba(255,255,255,0.08)",
        glow: "0 0 40px rgba(255,153,0,0.25)",
      },
      animation: {
        "float-slow": "float 18s ease-in-out infinite",
        "float-slower": "float 26s ease-in-out infinite",
        shimmer: "shimmer 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(40px,-30px) scale(1.08)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
    },
  },
  plugins: [],
};

