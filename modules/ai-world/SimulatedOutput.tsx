"use client";

import { useEffect, useRef, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { SIMULATED_OUTPUTS, WORKFLOW_NODES } from "@/lib/workflow-data";

const TYPE_SPEED: Record<string, number> = { json: 5, log: 18, success: 22, alert: 15 };

export default memo(function SimulatedOutput() {
  const { activeNodeId, theme } = useStore();
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [statusLine, setStatusLine] = useState("");
  const timerRef = useRef<NodeJS.Timeout>();
  const statusTimer = useRef<NodeJS.Timeout>();

  const output = activeNodeId ? SIMULATED_OUTPUTS[activeNodeId] : null;
  const activeNode = activeNodeId ? WORKFLOW_NODES.find((n) => n.id === activeNodeId) : null;

  const typeColors: Record<string, string> = {
    json: theme.accentColor,
    log: theme.primaryColor,
    alert: "#FF0040",
    success: theme.primaryColor,
  };

  useEffect(() => {
    clearTimeout(timerRef.current);
    clearTimeout(statusTimer.current);

    if (!output) {
      setDisplayedContent("");
      setIsTyping(false);
      setStatusLine("");
      return;
    }

    setDisplayedContent("");
    setIsTyping(true);
    setStatusLine("processing...");

    // Brief delay before typing starts — adds realism
    statusTimer.current = setTimeout(() => setStatusLine("receiving output"), 180);

    let i = 0;
    const text = output.content;
    const speed = TYPE_SPEED[output.type] ?? 10;

    const type = () => {
      if (i < text.length) {
        // Type in chunks for faster text
        const chunk = speed < 10 ? 4 : 1;
        i = Math.min(i + chunk, text.length);
        setDisplayedContent(text.slice(0, i));
        timerRef.current = setTimeout(type, speed);
      } else {
        setIsTyping(false);
        setStatusLine("complete");
        statusTimer.current = setTimeout(() => setStatusLine(""), 1500);
      }
    };

    timerRef.current = setTimeout(type, 280);
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(statusTimer.current);
    };
  }, [output]);

  return (
    <div
      className="flex flex-col h-full rounded-lg overflow-hidden"
      style={{
        background: "rgba(10, 13, 18, 0.82)",
        border: `1px solid ${theme.primaryColor}18`,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${theme.primaryColor}12` }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: activeNodeId ? theme.primaryColor : `${theme.primaryColor}30` }}
            animate={activeNodeId ? { opacity: [0.6, 1, 0.6] } : {}}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-xs font-mono tracking-widest opacity-60" style={{ color: theme.primaryColor }}>
            OUTPUT INSPECTOR
          </span>
        </div>
        <div className="flex items-center gap-2">
          {activeNode && (
            <span className="text-xs font-mono opacity-50" style={{ color: activeNode.color }}>
              {activeNode.icon} {activeNode.label}
            </span>
          )}
          {activeNodeId && (
            <button
              className="text-xs font-mono opacity-25 hover:opacity-60 transition-opacity"
              style={{ color: theme.primaryColor }}
              onClick={() => useStore.getState().setActiveNodeId(null)}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Status strip */}
      <AnimatePresence>
        {statusLine && (
          <motion.div
            className="px-4 py-1 flex items-center gap-2 flex-shrink-0"
            style={{ borderBottom: `1px solid ${theme.primaryColor}08`, background: `${theme.primaryColor}06` }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-1 h-1 rounded-full"
              style={{ background: theme.primaryColor }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
            <span className="text-xs font-mono opacity-50" style={{ color: theme.primaryColor }}>
              {statusLine}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto p-4">
        <AnimatePresence mode="wait">
          {!activeNodeId ? (
            <motion.div
              key="empty"
              className="h-full flex flex-col items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-2xl opacity-15" style={{ color: theme.primaryColor }}>
                ◈
              </div>
              <div
                className="text-xs font-mono text-center leading-relaxed"
                style={{ color: theme.primaryColor, opacity: 0.25 }}
              >
                select a node to trace
                <br />
                its execution output
              </div>

              {/* Quick-select list */}
              <div className="mt-3 w-full space-y-1.5">
                {WORKFLOW_NODES.map((n) => (
                  <motion.button
                    key={n.id}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-left"
                    style={{
                      background: `${n.color}07`,
                      border: `1px solid ${n.color}18`,
                    }}
                    whileHover={{ x: 2, background: `${n.color}12` }}
                    transition={{ duration: 0.12 }}
                    onClick={() => useStore.getState().setActiveNodeId(n.id)}
                    onMouseEnter={() => useStore.getState().setCursorVariant("hover")}
                    onMouseLeave={() => useStore.getState().setCursorVariant("default")}
                  >
                    <span style={{ fontSize: 11 }}>{n.icon}</span>
                    <span className="text-xs font-mono flex-1" style={{ color: n.color }}>
                      {n.label}
                    </span>
                    <span className="text-xs font-mono opacity-30" style={{ color: n.color }}>
                      →
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeNodeId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {/* Type badge */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    background: `${typeColors[output?.type ?? "log"]}12`,
                    border: `1px solid ${typeColors[output?.type ?? "log"]}28`,
                    color: typeColors[output?.type ?? "log"],
                  }}
                >
                  {output?.type?.toUpperCase()}
                </span>
                <span
                  className="text-xs font-mono"
                  style={{ color: theme.primaryColor, opacity: 0.45 }}
                >
                  {output?.title}
                </span>
              </div>

              {/* Output text */}
              <pre
                className="text-xs font-mono whitespace-pre-wrap leading-relaxed"
                style={{ color: typeColors[output?.type ?? "log"], opacity: 0.85 }}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div
        className="px-4 py-1.5 flex-shrink-0"
        style={{ borderTop: `1px solid ${theme.primaryColor}08` }}
      >
        <span className="text-xs font-mono opacity-15" style={{ color: theme.primaryColor }}>
          {activeNodeId
            ? isTyping
              ? "receiving..."
              : "output complete"
            : "awaiting node selection"}
        </span>
      </div>
    </div>
  );
});
