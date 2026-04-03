"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";

export default function WorldTransition() {
  const { isTransitioning, transitionPhase, world, theme } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Glitch canvas — skip on mobile for performance
  useEffect(() => {
    if (transitionPhase !== "glitch") {
      cancelAnimationFrame(animRef.current);
      return;
    }
    // Skip heavy glitch effect on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let frame = 0;
    const colors = [theme.primaryColor, theme.accentColor, "#FF0040", "#FFFFFF"];

    const animate = () => {
      if (frame > 20) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Horizontal glitch slices
      const numSlices = Math.floor(Math.random() * 10) + 5;
      for (let i = 0; i < numSlices; i++) {
        const y = Math.random() * canvas.height;
        const h = Math.random() * 36 + 3;
        const offset = (Math.random() - 0.5) * 50;
        const c = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = c + "14";
        ctx.fillRect(offset, y, canvas.width, h);
      }

      // RGB channel split
      for (let i = 0; i < 8; i++) {
        const y = Math.random() * canvas.height;
        const h = Math.random() * 6 + 1;
        ctx.fillStyle = "rgba(255,0,64,0.06)";
        ctx.fillRect(Math.random() * 14 - 7, y, canvas.width, h);
        ctx.fillStyle = `${theme.primaryColor}09`;
        ctx.fillRect(-(Math.random() * 14 - 7), y + 2, canvas.width, h);
      }

      // Vertical noise bar
      if (Math.random() > 0.55) {
        const x = Math.random() * canvas.width;
        ctx.fillStyle = "rgba(255,255,255,0.035)";
        ctx.fillRect(x, 0, Math.random() * 5 + 1, canvas.height);
      }

      frame++;
      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [transitionPhase, theme.primaryColor, theme.accentColor]);

  return (
    <>
      {/* Glitch canvas */}
      <AnimatePresence>
        {isTransitioning && transitionPhase === "glitch" && (
          <motion.canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9990]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>

      {/* Blur + color wash dissolve */}
      <AnimatePresence>
        {(transitionPhase === "dissolve" || transitionPhase === "reveal") && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-[9991]"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{
              opacity: transitionPhase === "dissolve" ? 1 : 0,
              backdropFilter:
                transitionPhase === "dissolve" ? "blur(18px)" : "blur(0px)",
            }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            style={{
              background: `radial-gradient(ellipse at center, ${theme.primaryColor}12 0%, rgba(11,15,20,0.6) 100%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Full black flash */}
      <AnimatePresence>
        {transitionPhase === "dissolve" && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-[9992] bg-[#0B0F14]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 1] }}
            transition={{ duration: 0.5, ease: "easeIn" }}
          />
        )}
      </AnimatePresence>

      {/* Fade back in */}
      <AnimatePresence>
        {transitionPhase === "reveal" && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-[9992] bg-[#0B0F14]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* World label flash */}
      <AnimatePresence>
        {transitionPhase === "reveal" && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-[9993] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.6, times: [0, 0.15, 0.75, 1] }}
          >
            <div className="text-center">
              <motion.div
                className="font-mono font-bold tracking-[0.5em]"
                style={{
                  fontSize: "clamp(32px, 5vw, 64px)",
                  color: theme.primaryColor,
                  textShadow: `0 0 30px ${theme.primaryColor}, 0 0 80px ${theme.primaryColor}60`,
                }}
                initial={{ letterSpacing: "0.2em" }}
                animate={{ letterSpacing: "0.5em" }}
                transition={{ duration: 0.4 }}
              >
                {world === "ai" ? "OPERATOR" : "BUILDER"}
              </motion.div>
              <div
                className="text-xs font-mono tracking-[0.6em] mt-2"
                style={{ color: `${theme.primaryColor}70` }}
              >
                MODE ACTIVATED
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan sweep */}
      <AnimatePresence>
        {transitionPhase === "reveal" && (
          <motion.div
            className="fixed left-0 right-0 pointer-events-none z-[9989]"
            style={{
              height: 2,
              background: `linear-gradient(90deg, transparent, ${theme.primaryColor}, transparent)`,
              boxShadow: `0 0 24px ${theme.primaryColor}, 0 0 60px ${theme.primaryColor}40`,
            }}
            initial={{ top: 0, opacity: 0 }}
            animate={{ top: "100vh", opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.55, ease: "linear" }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
