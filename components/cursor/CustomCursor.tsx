"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useStore } from "@/lib/store";

export default function CustomCursor() {
  const { cursorVariant, world, theme } = useStore();
  const setCursorPosition = useStore((s) => s.setCursorPosition);
  const [isTouch, setIsTouch] = useState(true); // default true to avoid flash

  useEffect(() => {
    // Coarse pointer = touch/mobile device — hide custom cursor
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth trailing dot
  const trailX = useSpring(mouseX, { stiffness: 200, damping: 30 });
  const trailY = useSpring(mouseY, { stiffness: 200, damping: 30 });

  // Slow outer ring
  const ringX = useSpring(mouseX, { stiffness: 80, damping: 25 });
  const ringY = useSpring(mouseY, { stiffness: 80, damping: 25 });

  const primaryColor = theme.primaryColor;
  const isAI = world === "ai";

  useEffect(() => {
    if (isTouch) return;
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mouseX, mouseY, setCursorPosition, isTouch]);

  // Don't render cursor on touch devices
  if (isTouch) return null;

  const variants = {
    default: { scale: 1, opacity: 1 },
    hover: { scale: 1.8, opacity: 0.9 },
    click: { scale: 0.7, opacity: 1 },
    terminal: { scale: 1, opacity: 1 },
    node: { scale: 1.5, opacity: 1 },
  };

  const ringVariants = {
    default: { scale: 1, opacity: 0.4 },
    hover: { scale: 1.6, opacity: 0.7 },
    click: { scale: 0.8, opacity: 1 },
    terminal: { scale: 1.2, opacity: 0.5 },
    node: { scale: 2, opacity: 0.6 },
  };

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
      >
        <motion.div
          animate={ringVariants[cursorVariant]}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            width: isAI ? 32 : 28,
            height: isAI ? 32 : 28,
            border: `1px solid ${primaryColor}`,
            borderRadius: isAI ? "4px" : "50%",
            opacity: 0.5,
          }}
        />
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: trailX, y: trailY, translateX: "-50%", translateY: "-50%" }}
      >
        <motion.div
          animate={variants[cursorVariant]}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
        >
          {isAI ? (
            // AI world: circuit node cursor
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="1" y="1" width="8" height="8" fill={primaryColor} rx="1" />
              <line x1="5" y1="0" x2="5" y2="1" stroke={primaryColor} strokeWidth="1" />
              <line x1="5" y1="9" x2="5" y2="10" stroke={primaryColor} strokeWidth="1" />
              <line x1="0" y1="5" x2="1" y2="5" stroke={primaryColor} strokeWidth="1" />
              <line x1="9" y1="5" x2="10" y2="5" stroke={primaryColor} strokeWidth="1" />
            </svg>
          ) : (
            // Dev world: terminal block cursor
            <div
              style={{
                width: 8,
                height: 8,
                background: primaryColor,
                borderRadius: "1px",
                boxShadow: `0 0 6px ${primaryColor}`,
              }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Glow trail on hover */}
      {cursorVariant === "hover" && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9998]"
          style={{
            x: ringX,
            y: ringY,
            translateX: "-50%",
            translateY: "-50%",
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${primaryColor}22 0%, transparent 70%)`,
          }}
        />
      )}
    </>
  );
}
