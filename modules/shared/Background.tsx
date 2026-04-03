"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useStore, type World } from "@/lib/store";

interface BackgroundProps {
  world: World;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; opacity: number;
  life: number; maxLife: number;
}

export default function Background({ world }: BackgroundProps) {
  const { theme } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const worldRef = useRef(world);

  // Parallax on mouse move
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 20 });
  const gridX = useTransform(springX, [-1, 1], [-12, 12]);
  const gridY = useTransform(springY, [-1, 1], [-8, 8]);

  useEffect(() => {
    // Skip parallax on touch/mobile — no mouse to track
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  // Keep world ref current for the canvas loop
  useEffect(() => { worldRef.current = world; }, [world]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const color = theme.primaryColor;
    const isMobileScreen = window.innerWidth < 768;
    const particleCount = isMobileScreen ? 20 : 55;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      size: Math.random() * 1.4 + 0.4,
      opacity: Math.random() * 0.35 + 0.08,
      life: Math.random() * 200,
      maxLife: 200 + Math.random() * 120,
    }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const currentWorld = worldRef.current;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      // Connection lines (AI world style — neural net) — skip on mobile for perf
      if (currentWorld === "ai" && !isMobileScreen) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 110) {
              const alpha = (1 - dist / 110) * 0.12;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, "0");
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      // Update + draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (p.x < 0) p.x = w;
        else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        else if (p.y > h) p.y = 0;

        if (p.life > p.maxLife) {
          p.life = 0;
          p.opacity = Math.random() * 0.35 + 0.08;
        }

        const lifeRatio = p.life / p.maxLife;
        const alpha = Math.sin(lifeRatio * Math.PI) * p.opacity;
        const hex = Math.floor(alpha * 255).toString(16).padStart(2, "0");

        ctx.beginPath();
        if (currentWorld === "ai") {
          ctx.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        }
        ctx.fillStyle = color + hex;
        ctx.fill();
      }

      // Dev: occasional floating characters
      if (currentWorld === "dev" && Math.random() > 0.964) {
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillStyle = color + "09";
        const chars = "01アイウエオカ∑∏∫√∞";
        ctx.fillText(
          chars[Math.floor(Math.random() * chars.length)],
          Math.random() * w,
          Math.random() * h
        );
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.primaryColor]); // only re-init when color changes

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient — morphs with world */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background:
            world === "ai"
              ? `radial-gradient(ellipse at 18% 50%, ${theme.primaryColor}09 0%, transparent 55%),
                 radial-gradient(ellipse at 82% 18%, ${theme.accentColor}06 0%, transparent 50%),
                 #0B0F14`
              : `radial-gradient(ellipse at 50% 95%, ${theme.primaryColor}07 0%, transparent 55%),
                 radial-gradient(ellipse at 5% 5%, ${theme.accentColor}05 0%, transparent 45%),
                 #0B0F14`,
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* Parallax grid — moves with mouse */}
      <motion.div
        className="absolute inset-0"
        style={{
          x: gridX,
          y: gridY,
          backgroundImage: `
            linear-gradient(${theme.primaryColor}05 1px, transparent 1px),
            linear-gradient(90deg, ${theme.primaryColor}05 1px, transparent 1px)
          `,
          backgroundSize: world === "ai" ? "44px 44px" : "22px 22px",
          opacity: world === "ai" ? 1 : 0.6,
          transition: "opacity 0.8s ease, background-size 0.8s ease",
        }}
      />

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" style={{ opacity: 0.75 }} />

      {/* Ambient glow orbs */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          x: useTransform(springX, [-1, 1], [-20, 20]),
          y: useTransform(springY, [-1, 1], [-15, 15]),
          width: 600,
          height: 600,
          top: "10%",
          left: "-10%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.primaryColor}06 0%, transparent 70%)`,
        }}
        animate={{ opacity: world === "ai" ? 1 : 0.4 }}
        transition={{ duration: 1.0 }}
      />
      <motion.div
        className="absolute pointer-events-none"
        style={{
          x: useTransform(springX, [-1, 1], [20, -20]),
          y: useTransform(springY, [-1, 1], [15, -15]),
          width: 500,
          height: 500,
          bottom: "0%",
          right: "-5%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.accentColor}05 0%, transparent 70%)`,
        }}
        animate={{ opacity: world === "dev" ? 1 : 0.4 }}
        transition={{ duration: 1.0 }}
      />

      {/* Horizontal light lines (AI) */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: world === "ai" ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        {[0.28, 0.72].map((pos, i) => (
          <div
            key={i}
            className="absolute left-0 right-0"
            style={{
              top: `${pos * 100}%`,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${theme.primaryColor}10, transparent)`,
            }}
          />
        ))}
      </motion.div>

      {/* Scanline (dev) */}
      <motion.div
        className="absolute left-0 right-0 pointer-events-none"
        style={{ height: 1, background: `${theme.primaryColor}18` }}
        animate={world === "dev" ? { top: ["0%", "100%"] } : { top: "0%" }}
        transition={{ duration: 9, ease: "linear", repeat: Infinity }}
      />

      {/* Deep vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
