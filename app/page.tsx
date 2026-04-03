"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { setCSSVar } from "@/lib/utils";
import CustomCursor from "@/components/cursor/CustomCursor";
import WorldTransition from "@/components/transition/WorldTransition";
import ThemePlayground from "@/components/theme/ThemePlayground";
import WorldNav from "@/components/navigation/WorldNav";
import AIWorld from "@/modules/ai-world/AIWorld";
import DevWorld from "@/modules/dev-world/DevWorld";
import EasterEgg from "@/modules/shared/EasterEgg";
import Background from "@/modules/shared/Background";

export default function Home() {
  const { world, theme } = useStore();
  const lastScrollTime = useRef(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  // Sync CSS variables with theme store
  useEffect(() => {
    setCSSVar("--primary", theme.primaryColor);
    setCSSVar("--accent", theme.accentColor);
  }, [theme.primaryColor, theme.accentColor]);

  // Sync font
  useEffect(() => {
    const fontMap = {
      mono: "'JetBrains Mono', monospace",
      sans: "'Inter', sans-serif",
      display: "'Space Grotesk', sans-serif",
    };
    setCSSVar("--font", fontMap[theme.font]);
    document.body.style.fontFamily = fontMap[theme.font];
  }, [theme.font]);

  // ── Scroll-to-switch (wheel, desktop only) ────────────────────────────────
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Skip on mobile/touch-primary devices
      if (window.innerWidth < 768) return;
      const now = Date.now();
      if (now - lastScrollTime.current < 1400) return;
      const { world: w, isTransitioning, triggerTransition } = useStore.getState();
      if (isTransitioning) return;

      if (e.deltaY > 40 && w === "ai") {
        lastScrollTime.current = now;
        triggerTransition("dev");
      } else if (e.deltaY < -40 && w === "dev") {
        lastScrollTime.current = now;
        triggerTransition("ai");
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  // ── Swipe-to-switch (touch) — horizontal swipe only ───────────────────────
  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    };

    const onEnd = (e: TouchEvent) => {
      const dx = touchStartX.current - e.changedTouches[0].clientX;
      const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
      const dt = Date.now() - touchStartTime.current;
      const now = Date.now();

      // Must be a clear horizontal swipe: |dx| > |dy|, fast enough, long enough
      if (Math.abs(dx) < 70 || dy > Math.abs(dx) * 0.65 || dt > 500) return;
      if (now - lastScrollTime.current < 1400) return;

      const { world: w, isTransitioning, triggerTransition } = useStore.getState();
      if (isTransitioning) return;

      // swipe left (dx > 0) → go to DEV; swipe right (dx < 0) → go to AI
      if (dx > 0 && w === "ai") {
        lastScrollTime.current = now;
        triggerTransition("dev");
      } else if (dx < 0 && w === "dev") {
        lastScrollTime.current = now;
        triggerTransition("ai");
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0B0F14", fontFamily: "var(--font)" }}
    >
      {/* Scanlines — hidden on mobile for performance */}
      <div className="scanlines pointer-events-none hidden md:block" />

      {/* Background — always rendered, morphs based on world */}
      <Background world={world} />

      {/* ── World layers ── both always mounted, cross-fade via CSS */}
      <div
        className="absolute inset-0"
        style={{
          opacity: world === "ai" ? 1 : 0,
          transition: "opacity 0.45s ease-in-out",
          pointerEvents: world === "ai" ? "auto" : "none",
        }}
      >
        <AIWorld />
      </div>

      <div
        className="absolute inset-0"
        style={{
          opacity: world === "dev" ? 1 : 0,
          transition: "opacity 0.45s ease-in-out",
          pointerEvents: world === "dev" ? "auto" : "none",
        }}
      >
        <DevWorld />
      </div>

      {/* Navigation chrome */}
      <WorldNav />

      {/* Cinematic transition overlay */}
      <WorldTransition />

      {/* Theme playground */}
      <ThemePlayground />

      {/* Easter egg */}
      <EasterEgg />

      {/* Custom cursor — hidden on touch devices via the component itself */}
      <CustomCursor />
    </main>
  );
}
