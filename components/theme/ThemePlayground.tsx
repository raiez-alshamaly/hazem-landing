"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStore, type Vibe, type FontChoice } from "@/lib/store";

const PRESET_COLORS = [
  { label: "Neon Green", value: "#00FF88" },
  { label: "Cyber Blue", value: "#00D4FF" },
  { label: "Matrix", value: "#00FF41" },
  { label: "Purple", value: "#B400FF" },
  { label: "Red", value: "#FF0040" },
  { label: "Gold", value: "#FFD700" },
  { label: "Orange", value: "#FF6B00" },
  { label: "Pink", value: "#FF006E" },
  { label: "White", value: "#E2E8F0" },
];

const ACCENT_COLORS = [
  { label: "Blue", value: "#00D4FF" },
  { label: "Purple", value: "#B400FF" },
  { label: "Neon Green", value: "#00FF88" },
  { label: "Red", value: "#FF0040" },
  { label: "Gold", value: "#FFD700" },
  { label: "White", value: "#94A3B8" },
];

const VIBES: { label: string; value: Vibe; desc: string }[] = [
  { label: "NEON", value: "neon", desc: "Electric glow" },
  { label: "MINIMAL", value: "minimal", desc: "Clean silence" },
  { label: "CYBER", value: "cyber", desc: "Dark signal" },
];

const FONTS: { label: string; value: FontChoice; preview: string }[] = [
  { label: "MONO", value: "mono", preview: "JetBrains Mono" },
  { label: "SANS", value: "sans", preview: "Inter" },
  { label: "DISPLAY", value: "display", preview: "Space Grotesk" },
];

export default function ThemePlayground() {
  const { themePlaygroundOpen, theme, setTheme, applyVibe, toggleThemePlayground } = useStore();
  const setCursorVariant = useStore((s) => s.setCursorVariant);

  return (
    <AnimatePresence>
      {themePlaygroundOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleThemePlayground}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-4 top-14 z-[201] w-72"
            style={{
              background: "rgba(11, 15, 20, 0.95)",
              border: `1px solid ${theme.primaryColor}30`,
              borderRadius: "8px",
              backdropFilter: "blur(20px)",
            }}
            initial={{ opacity: 0, x: 20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: `1px solid ${theme.primaryColor}20` }}
            >
              <span
                className="text-xs font-mono tracking-[0.3em]"
                style={{ color: theme.primaryColor }}
              >
                THEME PLAYGROUND
              </span>
              <button
                className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity"
                style={{ color: theme.primaryColor }}
                onClick={toggleThemePlayground}
              >
                [ESC]
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Primary Color */}
              <div>
                <div
                  className="text-xs font-mono tracking-widest mb-2 opacity-60"
                  style={{ color: theme.primaryColor }}
                >
                  PRIMARY COLOR
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      className="w-6 h-6 rounded transition-transform hover:scale-125"
                      style={{
                        background: c.value,
                        boxShadow:
                          theme.primaryColor === c.value
                            ? `0 0 10px ${c.value}, 0 0 20px ${c.value}`
                            : "none",
                        outline:
                          theme.primaryColor === c.value
                            ? `2px solid ${c.value}`
                            : "none",
                        outlineOffset: "2px",
                        transform:
                          theme.primaryColor === c.value ? "scale(1.2)" : "scale(1)",
                      }}
                      title={c.label}
                      onClick={() => setTheme({ primaryColor: c.value })}
                      onMouseEnter={() => setCursorVariant("hover")}
                      onMouseLeave={() => setCursorVariant("default")}
                    />
                  ))}
                  {/* Custom color */}
                  <div className="relative">
                    <input
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({ primaryColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer opacity-0 absolute inset-0"
                    />
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-xs pointer-events-none"
                      style={{ border: `1px solid ${theme.primaryColor}40`, color: theme.primaryColor }}
                    >
                      +
                    </div>
                  </div>
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <div
                  className="text-xs font-mono tracking-widest mb-2 opacity-60"
                  style={{ color: theme.primaryColor }}
                >
                  ACCENT COLOR
                </div>
                <div className="flex flex-wrap gap-2">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      className="w-6 h-6 rounded transition-transform hover:scale-125"
                      style={{
                        background: c.value,
                        outline:
                          theme.accentColor === c.value
                            ? `2px solid ${c.value}`
                            : "none",
                        outlineOffset: "2px",
                        transform:
                          theme.accentColor === c.value ? "scale(1.2)" : "scale(1)",
                      }}
                      title={c.label}
                      onClick={() => setTheme({ accentColor: c.value })}
                      onMouseEnter={() => setCursorVariant("hover")}
                      onMouseLeave={() => setCursorVariant("default")}
                    />
                  ))}
                </div>
              </div>

              {/* Vibe Presets */}
              <div>
                <div
                  className="text-xs font-mono tracking-widest mb-2 opacity-60"
                  style={{ color: theme.primaryColor }}
                >
                  VIBE PRESET
                </div>
                <div className="flex gap-2">
                  {VIBES.map((v) => (
                    <button
                      key={v.value}
                      className="flex-1 py-2 rounded text-xs font-mono tracking-wider transition-all"
                      style={{
                        background: theme.vibe === v.value ? theme.primaryColor : "transparent",
                        border: `1px solid ${theme.primaryColor}40`,
                        color: theme.vibe === v.value ? "#0B0F14" : theme.primaryColor,
                      }}
                      onClick={() => applyVibe(v.value)}
                      onMouseEnter={() => setCursorVariant("hover")}
                      onMouseLeave={() => setCursorVariant("default")}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font */}
              <div>
                <div
                  className="text-xs font-mono tracking-widest mb-2 opacity-60"
                  style={{ color: theme.primaryColor }}
                >
                  FONT FAMILY
                </div>
                <div className="flex gap-2">
                  {FONTS.map((f) => (
                    <button
                      key={f.value}
                      className="flex-1 py-2 rounded text-xs font-mono tracking-wider transition-all"
                      style={{
                        background: theme.font === f.value ? theme.primaryColor : "transparent",
                        border: `1px solid ${theme.primaryColor}40`,
                        color: theme.font === f.value ? "#0B0F14" : theme.primaryColor,
                      }}
                      onClick={() => setTheme({ font: f.value })}
                      onMouseEnter={() => setCursorVariant("hover")}
                      onMouseLeave={() => setCursorVariant("default")}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div
                className="p-3 rounded text-xs font-mono"
                style={{
                  background: `${theme.primaryColor}08`,
                  border: `1px solid ${theme.primaryColor}20`,
                  color: theme.primaryColor,
                }}
              >
                <span className="opacity-40">preview: </span>
                <span style={{ color: theme.primaryColor }}>
                  hazem.system({"{"}vibe: &quot;{theme.vibe}&quot;{"}"})
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
