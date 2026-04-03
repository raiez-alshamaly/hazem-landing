"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";

export default function WorldNav() {
  const { world, toggleThemePlayground, themePlaygroundOpen, theme, isTransitioning, triggerTransition } = useStore();
  const setCursorVariant = useStore((s) => s.setCursorVariant);
  const [time, setTime] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const isAI = world === "ai";

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ borderBottom: `1px solid ${theme.primaryColor}15` }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <motion.div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: theme.primaryColor }}
            animate={{ boxShadow: [`0 0 4px ${theme.primaryColor}`, `0 0 12px ${theme.primaryColor}`, `0 0 4px ${theme.primaryColor}`] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span
            className="text-sm font-mono tracking-[0.2em] md:tracking-[0.3em] font-medium"
            style={{ color: theme.primaryColor }}
          >
            HAZEM.OS
          </span>
          <span className="hidden md:inline text-xs font-mono opacity-30" style={{ color: theme.primaryColor }}>
            v2.4.1
          </span>
        </div>

        {/* Center — animated world label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={world}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <span
              className="text-xs font-mono tracking-[0.15em] md:tracking-[0.25em]"
              style={{ color: theme.primaryColor, opacity: 0.55 }}
            >
              {isAI ? (isMobile ? "AI MODE" : "AI OPERATOR MODE") : (isMobile ? "DEV MODE" : "DEV BUILDER MODE")}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile: world switch tabs */}
          {isMobile && (
            <div
              className="flex items-center rounded-lg overflow-hidden"
              style={{ border: `1px solid ${theme.primaryColor}25` }}
            >
              <button
                className="px-3 py-1.5 text-xs font-mono transition-colors"
                style={{
                  color: isAI ? "#0B0F14" : theme.primaryColor,
                  background: isAI ? theme.primaryColor : "transparent",
                  opacity: isAI ? 1 : 0.5,
                }}
                onClick={() => !isTransitioning && !isAI && triggerTransition("ai")}
              >
                AI
              </button>
              <div style={{ width: 1, background: `${theme.primaryColor}25`, height: 20 }} />
              <button
                className="px-3 py-1.5 text-xs font-mono transition-colors"
                style={{
                  color: !isAI ? "#0B0F14" : theme.primaryColor,
                  background: !isAI ? theme.primaryColor : "transparent",
                  opacity: !isAI ? 1 : 0.5,
                }}
                onClick={() => !isTransitioning && isAI && triggerTransition("dev")}
              >
                DEV
              </button>
            </div>
          )}

          {/* THEME button */}
          <motion.button
            className="text-xs font-mono tracking-wider px-2.5 md:px-3 py-1.5 rounded"
            style={{
              border: `1px solid ${theme.primaryColor}35`,
              color: themePlaygroundOpen ? "#0B0F14" : theme.primaryColor,
              background: themePlaygroundOpen ? theme.primaryColor : "transparent",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleThemePlayground}
            onMouseEnter={() => setCursorVariant("hover")}
            onMouseLeave={() => setCursorVariant("default")}
          >
            THEME
          </motion.button>
        </div>
      </motion.div>

      {/* ── Right side: vertical world scroll indicator (desktop only) ────────── */}
      <motion.div
        className="hidden md:flex fixed right-5 top-1/2 -translate-y-1/2 z-[100] flex-col items-center gap-3"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* AI dot */}
        <button
          className="group flex items-center gap-2"
          onClick={() => !isTransitioning && triggerTransition("ai")}
          onMouseEnter={() => setCursorVariant("hover")}
          onMouseLeave={() => setCursorVariant("default")}
          title="Scroll up → AI Operator"
        >
          <span
            className="text-xs font-mono opacity-0 group-hover:opacity-60 transition-opacity duration-200 tracking-wider"
            style={{ color: theme.primaryColor }}
          >
            AI
          </span>
          <motion.div
            className="rounded-full"
            style={{
              width: isAI ? 8 : 6,
              height: isAI ? 8 : 6,
              background: isAI ? theme.primaryColor : "transparent",
              border: `1.5px solid ${isAI ? theme.primaryColor : theme.primaryColor + "50"}`,
              boxShadow: isAI ? `0 0 8px ${theme.primaryColor}` : "none",
            }}
            animate={{ scale: isAI ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 2, repeat: isAI ? Infinity : 0 }}
          />
        </button>

        {/* Track line */}
        <div
          className="relative w-px overflow-hidden"
          style={{ height: 48, background: `${theme.primaryColor}20` }}
        >
          <motion.div
            className="absolute left-0 right-0"
            style={{ background: theme.primaryColor, height: "50%" }}
            animate={{ top: isAI ? "0%" : "50%" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* DEV dot */}
        <button
          className="group flex items-center gap-2"
          onClick={() => !isTransitioning && triggerTransition("dev")}
          onMouseEnter={() => setCursorVariant("hover")}
          onMouseLeave={() => setCursorVariant("default")}
          title="Scroll down → DEV Builder"
        >
          <motion.div
            className="rounded-full"
            style={{
              width: !isAI ? 8 : 6,
              height: !isAI ? 8 : 6,
              background: !isAI ? theme.primaryColor : "transparent",
              border: `1.5px solid ${!isAI ? theme.primaryColor : theme.primaryColor + "50"}`,
              boxShadow: !isAI ? `0 0 8px ${theme.primaryColor}` : "none",
            }}
            animate={{ scale: !isAI ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 2, repeat: !isAI ? Infinity : 0 }}
          />
          <span
            className="text-xs font-mono opacity-0 group-hover:opacity-60 transition-opacity duration-200 tracking-wider"
            style={{ color: theme.primaryColor }}
          >
            DEV
          </span>
        </button>
      </motion.div>

      {/* ── Bottom status bar ────────────────────────────────────────────────── */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-between px-4 md:px-6 py-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        style={{ borderTop: `1px solid ${theme.primaryColor}10` }}
      >
        {/* Desktop left */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-xs font-mono opacity-25" style={{ color: theme.primaryColor }}>
            ◆ {isAI ? "WORKFLOW ACTIVE" : "TERMINAL READY"}
          </span>
          <span className="text-xs font-mono opacity-15" style={{ color: theme.primaryColor }}>|</span>
          <span className="text-xs font-mono opacity-20" style={{ color: theme.primaryColor }}>
            {isAI ? "click nodes to inspect" : 'type "help" to explore'}
          </span>
        </div>

        {/* Mobile left */}
        <div className="md:hidden flex items-center gap-2">
          <span className="text-xs font-mono opacity-25" style={{ color: theme.primaryColor }}>
            ◆ {isAI ? "WORKFLOW" : "TERMINAL"}
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          {/* Swipe hint — mobile */}
          <motion.div
            className="md:hidden flex items-center gap-1.5"
            animate={{ opacity: [0.12, 0.3, 0.12] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-xs font-mono" style={{ color: theme.primaryColor }}>
              ← swipe to switch →
            </span>
          </motion.div>

          {/* Scroll hint — desktop */}
          <motion.div
            className="hidden md:flex items-center gap-1.5"
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-xs font-mono" style={{ color: theme.primaryColor }}>
              {isAI ? "SCROLL ↓" : "SCROLL ↑"} to switch worlds
            </span>
          </motion.div>

          <span className="text-xs font-mono opacity-25" style={{ color: theme.primaryColor }}>
            {time}
          </span>
        </div>
      </motion.div>
    </>
  );
}
