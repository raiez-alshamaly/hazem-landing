"use client";

import { useState, useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import {
  WORKFLOW_NODES,
  SIMULATED_OUTPUTS,
  DOWNSTREAM_NODES,
} from "@/lib/workflow-data";

const TYPE_SPEED: Record<string, number> = { json: 4, log: 14, success: 18, alert: 12 };
const typeColors: Record<string, string> = {
  json: "#00D4FF",
  log: "#00FF88",
  alert: "#FF0040",
  success: "#00FF88",
};

export default memo(function MobileWorkflowCards() {
  const { theme, activeNodeId, setActiveNodeId } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activatedNodes, setActivatedNodes] = useState<Set<string>>(new Set());
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const cascadeRefs = useRef<NodeJS.Timeout[]>([]);

  // Cascade activation
  useEffect(() => {
    cascadeRefs.current.forEach(clearTimeout);
    cascadeRefs.current = [];

    if (!activeNodeId) {
      setActivatedNodes(new Set());
      return;
    }

    const path = DOWNSTREAM_NODES[activeNodeId] ?? [activeNodeId];
    setActivatedNodes(new Set([path[0]]));
    path.forEach((id, i) => {
      if (i === 0) return;
      const t = setTimeout(() => {
        setActivatedNodes((prev) => {
          const s = new Set(prev);
          s.add(id);
          return s;
        });
      }, i * 200);
      cascadeRefs.current.push(t);
    });

    return () => cascadeRefs.current.forEach(clearTimeout);
  }, [activeNodeId]);

  // Typewriter for output
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!activeNodeId) {
      setDisplayedContent("");
      setIsTyping(false);
      return;
    }

    const output = SIMULATED_OUTPUTS[activeNodeId];
    if (!output) return;

    setDisplayedContent("");
    setIsTyping(true);

    let i = 0;
    const text = output.content;
    const speed = TYPE_SPEED[output.type] ?? 12;

    const type = () => {
      if (i < text.length) {
        const chunk = speed < 8 ? 5 : 1;
        i = Math.min(i + chunk, text.length);
        setDisplayedContent(text.slice(0, i));
        timerRef.current = setTimeout(type, speed);
      } else {
        setIsTyping(false);
      }
    };

    timerRef.current = setTimeout(type, 280);
    return () => clearTimeout(timerRef.current);
  }, [activeNodeId]);

  // Card swipe handlers — stop propagation so world-switch swipe doesn't fire
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (Math.abs(dx) < 45 || dy > Math.abs(dx) * 0.8) return;

    if (dx > 0 && currentIndex < WORKFLOW_NODES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (dx < 0 && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
    // If at boundary (first/last card), let parent handle world switch
  };

  const node = WORKFLOW_NODES[currentIndex];
  const isSelected = activeNodeId === node.id;
  const isActivated = activatedNodes.has(node.id);
  const output = activeNodeId ? SIMULATED_OUTPUTS[activeNodeId] : null;
  const outputColor = output
    ? typeColors[output.type] || theme.primaryColor
    : theme.primaryColor;

  const handleCardTap = () => {
    setActiveNodeId(isSelected ? null : node.id);
    // Haptic feedback if supported
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Cards section */}
      <div className="flex-shrink-0 px-4 pt-2">
        {/* Status row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono opacity-35" style={{ color: theme.primaryColor }}>
            node {currentIndex + 1} / {WORKFLOW_NODES.length}
          </span>
          <AnimatePresence>
            {activeNodeId && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                exit={{ opacity: 0 }}
                className="text-xs font-mono"
                style={{ color: theme.primaryColor }}
                onClick={() => setActiveNodeId(null)}
              >
                [clear]
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Main card */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl p-5 relative overflow-hidden select-none"
              style={{
                background: `${node.color}0D`,
                border: `1.5px solid ${isSelected ? node.color + "80" : node.color + "28"}`,
                boxShadow: isSelected ? `0 4px 28px ${node.color}22` : "0 2px 12px rgba(0,0,0,0.3)",
              }}
              onClick={handleCardTap}
            >
              {/* Top color bar */}
              <div
                className="absolute top-0 left-0 right-0"
                style={{
                  height: 2,
                  background: node.color,
                  opacity: isActivated ? 1 : 0.35,
                  transition: "opacity 0.3s ease",
                }}
              />

              {/* Shimmer on activation */}
              {isActivated && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${node.color}14 50%, transparent 100%)`,
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "linear", repeatDelay: 0.8 }}
                />
              )}

              <div className="flex items-start gap-4">
                <span
                  style={{
                    fontSize: 36,
                    lineHeight: 1,
                    flexShrink: 0,
                    filter: isActivated ? `drop-shadow(0 0 8px ${node.color})` : "none",
                    transition: "filter 0.3s ease",
                  }}
                >
                  {node.icon}
                </span>

                <div className="flex-1 min-w-0">
                  <div
                    className="font-mono font-bold text-lg leading-tight"
                    style={{
                      color: node.color,
                      textShadow: isActivated ? `0 0 8px ${node.color}` : "none",
                      transition: "text-shadow 0.3s ease",
                    }}
                  >
                    {node.label}
                  </div>
                  <div
                    className="font-mono text-sm mt-0.5 opacity-50"
                    style={{ color: node.color }}
                  >
                    {node.sublabel}
                  </div>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{
                        background: `${node.color}15`,
                        border: `1px solid ${node.color}28`,
                        color: node.color,
                        opacity: 0.75,
                      }}
                    >
                      {node.type.toUpperCase()}
                    </span>
                    <span
                      className="text-xs font-mono opacity-35"
                      style={{ color: node.color }}
                    >
                      {isSelected ? "● executing" : "tap to run →"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active pulse ring */}
              {isActivated && !isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{ border: `1px solid ${node.color}` }}
                  animate={{ opacity: [0.5, 0.1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot pagination */}
        <div className="flex justify-center items-center gap-2.5 mt-4">
          {WORKFLOW_NODES.map((n, i) => (
            <button
              key={n.id}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: i === currentIndex ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === currentIndex ? n.color : `${theme.primaryColor}22`,
                transition: "all 0.3s ease",
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Quick-select chip row */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {WORKFLOW_NODES.map((n, i) => (
            <button
              key={n.id}
              onClick={() => {
                setCurrentIndex(i);
                setActiveNodeId(n.id === activeNodeId ? null : n.id);
                if (navigator.vibrate) navigator.vibrate(8);
              }}
              className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono"
              style={{
                background: activeNodeId === n.id ? `${n.color}1A` : `${n.color}08`,
                border: `1px solid ${activeNodeId === n.id ? n.color + "50" : n.color + "1C"}`,
                color: n.color,
              }}
            >
              <span style={{ fontSize: 12 }}>{n.icon}</span>
              <span className="opacity-75">{n.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Output panel — slides in below */}
      <AnimatePresence>
        {activeNodeId && output && (
          <motion.div
            className="flex-1 min-h-0 mx-4 mt-4 rounded-xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: "rgba(8, 10, 14, 0.92)",
              border: `1px solid ${theme.primaryColor}18`,
            }}
          >
            {/* Output header */}
            <div
              className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
              style={{ borderBottom: `1px solid ${theme.primaryColor}12` }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    background: `${outputColor}12`,
                    border: `1px solid ${outputColor}28`,
                    color: outputColor,
                  }}
                >
                  {output.type.toUpperCase()}
                </span>
                <span className="text-xs font-mono opacity-45" style={{ color: theme.primaryColor }}>
                  {output.title}
                </span>
              </div>
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    className="flex items-center gap-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="w-1 h-1 rounded-full"
                      style={{ background: theme.primaryColor }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                    />
                    <span className="text-xs font-mono opacity-30" style={{ color: theme.primaryColor }}>
                      receiving
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Output content */}
            <div className="flex-1 overflow-auto p-4">
              <pre
                className="text-xs font-mono whitespace-pre-wrap leading-relaxed"
                style={{ color: outputColor, opacity: 0.85 }}
              >
                {displayedContent}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    style={{ color: theme.primaryColor }}
                  >
                    ▌
                  </motion.span>
                )}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty hint */}
      <AnimatePresence>
        {!activeNodeId && (
          <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center px-8">
              <div className="text-2xl mb-2 opacity-15" style={{ color: theme.primaryColor }}>
                ◈
              </div>
              <div
                className="text-xs font-mono leading-relaxed"
                style={{ color: theme.primaryColor, opacity: 0.2 }}
              >
                tap a node to trace execution
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
