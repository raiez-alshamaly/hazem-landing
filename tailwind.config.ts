import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0B0F14",
          secondary: "#0D1117",
          tertiary: "#111827",
        },
        neon: {
          green: "#00FF88",
          blue: "#00D4FF",
          purple: "#B400FF",
          red: "#FF0040",
          yellow: "#FFD700",
        },
        terminal: {
          green: "#00FF41",
          dim: "#00AA2A",
          bg: "#0C0C0C",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
        sans: ["'Inter'", "'SF Pro Display'", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "'Syne'", "system-ui", "sans-serif"],
      },
      animation: {
        "cursor-blink": "blink 1s step-end infinite",
        "glitch": "glitch 0.3s ease-in-out",
        "scan-line": "scanline 3s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "type": "typing 3.5s steps(40, end)",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "node-pulse": "nodePulse 2s ease-in-out infinite",
        "data-flow": "dataFlow 2s linear infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 5px #00FF88, 0 0 10px #00FF88" },
          "50%": { boxShadow: "0 0 20px #00FF88, 0 0 40px #00FF88, 0 0 60px #00FF88" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        nodePulse: {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        dataFlow: {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      backgroundImage: {
        "grid-neon": "linear-gradient(rgba(0,255,136,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.05) 1px, transparent 1px)",
        "grid-cyber": "linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)",
        "noise": "url('/noise.png')",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
      boxShadow: {
        "neon-green": "0 0 10px #00FF88, 0 0 20px #00FF88, 0 0 40px #00FF88",
        "neon-blue": "0 0 10px #00D4FF, 0 0 20px #00D4FF, 0 0 40px #00D4FF",
        "neon-purple": "0 0 10px #B400FF, 0 0 20px #B400FF",
        "terminal": "0 0 30px rgba(0,255,65,0.15)",
        "node": "0 4px 20px rgba(0,255,136,0.2)",
      },
    },
  },
  plugins: [
    // scrollbar-hide utility
    function ({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
        ".scrollbar-hide::-webkit-scrollbar": {
          display: "none",
        },
      });
    },
  ],
};

export default config;
