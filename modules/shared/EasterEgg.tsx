"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";

export default function EasterEgg() {
  const { easterEggActivated, easterEggMessage, dismissEasterEgg, theme } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Matrix rain effect
  useEffect(() => {
    if (!easterEggActivated) {
      cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols = Math.floor(canvas.width / 16);
    const drops: number[] = Array(cols).fill(0);
    const chars = "01アイウエオハゼムABCDEFGHIJKLMNOPQRSTUVWXYZ∑∏∫√∞◆▲▼░▒▓";

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "14px 'JetBrains Mono', monospace";

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const brightness = Math.random();

        if (brightness > 0.98) {
          ctx.fillStyle = "#FFFFFF";
        } else if (brightness > 0.8) {
          ctx.fillStyle = theme.primaryColor;
        } else {
          ctx.fillStyle = `${theme.primaryColor}88`;
        }

        ctx.fillText(char, i * 16, drops[i] * 16);

        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, [easterEggActivated, theme.primaryColor]);

  // Konami code listener
  useEffect(() => {
    const sequence = [
      "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
      "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
      "b", "a",
    ];
    let pos = 0;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === sequence[pos]) {
        pos++;
        if (pos === sequence.length) {
          useStore.getState().activateEasterEgg(
            "KONAMI CODE DETECTED. GHOST PROTOCOL INITIALIZED. WELCOME TO THE MATRIX."
          );
          pos = 0;
        }
      } else {
        pos = 0;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AnimatePresence>
      {easterEggActivated && (
        <motion.div
          className="fixed inset-0 z-[500] flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={dismissEasterEgg}
        >
          {/* Matrix rain canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            style={{ opacity: 0.7 }}
          />

          {/* Message overlay */}
          <motion.div
            className="relative z-10 text-center px-8 max-w-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
          >
            <div
              className="text-xs font-mono tracking-[0.5em] mb-6 opacity-60"
              style={{ color: theme.primaryColor }}
            >
              ◆ HIDDEN LAYER ACCESSED ◆
            </div>

            <div
              className="text-2xl sm:text-4xl font-mono font-bold leading-relaxed"
              style={{
                color: theme.primaryColor,
                textShadow: `0 0 20px ${theme.primaryColor}, 0 0 60px ${theme.primaryColor}`,
              }}
            >
              {easterEggMessage}
            </div>

            <div
              className="mt-8 text-xs font-mono tracking-[0.3em] opacity-40"
              style={{ color: theme.primaryColor }}
            >
              — click anywhere to exit —
            </div>

            {/* Decorative corners */}
            {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-6 h-6`}
                style={{
                  borderTop: i < 2 ? `2px solid ${theme.primaryColor}` : "none",
                  borderBottom: i >= 2 ? `2px solid ${theme.primaryColor}` : "none",
                  borderLeft: i % 2 === 0 ? `2px solid ${theme.primaryColor}` : "none",
                  borderRight: i % 2 === 1 ? `2px solid ${theme.primaryColor}` : "none",
                }}
              />
            ))}
          </motion.div>

          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${theme.primaryColor}15 0%, transparent 70%)`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
