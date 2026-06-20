/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B0F19", // Deep enterprise dark
        surface: "#151B2B",    // Card background
        surfaceHighlight: "#1E293B",
        border: "#334155",
        primary: "#3B82F6",    // Trust Blue
        success: "#10B981",    // Operational Green
        warning: "#F59E0B",    // Caution Amber
        danger: "#EF4444",     // Critical Red
        text: {
          main: "#F8FAFC",
          muted: "#94A3B8",
          dim: "#475569"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}