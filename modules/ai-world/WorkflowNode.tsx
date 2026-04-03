"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { type WorkflowNode as WorkflowNodeType, NODE_W, NODE_H } from "@/lib/workflow-data";

interface WorkflowNodeProps {
  node: WorkflowNodeType;
  scale: number;
  isActivated: boolean;
  isDimmed: boolean;
  hasActiveContext: boolean;
}

const typeStyles: Record<
  WorkflowNodeType["type"],
  { bg: string; border: string }
> = {
  trigger:  { bg: "rgba(0,255,136,0.07)",  border: "rgba(0,255,136,0.45)" },
  process:  { bg: "rgba(0,212,255,0.07)",  border: "rgba(0,212,255,0.35)" },
  api:      { bg: "rgba(180,0,255,0.08)",  border: "rgba(180,0,255,0.45)" },
  decision: { bg: "rgba(255,215,0,0.07)",  border: "rgba(255,215,0,0.35)" },
  output:   { bg: "rgba(0,255,136,0.05)",  border: "rgba(0,255,136,0.28)" },
  error:    { bg: "rgba(255,0,64,0.07)",   border: "rgba(255,0,64,0.45)" },
};

export default memo(function WorkflowNode({
  node,
  scale,
  isActivated,
  isDimmed,
  hasActiveContext,
}: WorkflowNodeProps) {
  const { activeNodeId, setActiveNodeId } = useStore();
  const setCursorVariant = useStore((s) => s.setCursorVariant);

  const isSelected = activeNodeId === node.id;
  const style = typeStyles[node.type];
  const w = NODE_W * scale;
  const h = NODE_H * scale;
  const fontSize = Math.max(9, 11 * scale);
  const subSize = Math.max(8, 9 * scale);
  const iconSize = Math.max(13, 16 * scale);

  return (
    <motion.div
      className="relative select-none"
      style={{ width: w, height: h, cursor: "none" }}
      animate={{
        opacity: isDimmed ? 0.18 : 1,
        scale: isActivated && !isSelected ? 1.02 : 1,
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={!isDimmed ? { scale: 1.04 } : {}}
      whileTap={!isDimmed ? { scale: 0.97 } : {}}
      onClick={() => !isDimmed && setActiveNodeId(isSelected ? null : node.id)}
      onMouseEnter={() => !isDimmed && setCursorVariant("node")}
      onMouseLeave={() => setCursorVariant("default")}
    >
      {/* Outer pulse ring when activated */}
      {isActivated && !isSelected && (
        <motion.div
          className="absolute inset-0 rounded-md pointer-events-none"
          style={{ border: `1px solid ${node.color}` }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: [0.7, 0.2, 0.7], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Selection ring */}
      {isSelected && (
        <motion.div
          className="absolute rounded-md pointer-events-none"
          style={{
            inset: -2,
            border: `1.5px solid ${node.color}`,
            boxShadow: `0 0 16px ${node.color}40`,
          }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      {/* Node body */}
      <motion.div
        className="absolute inset-0 rounded-md overflow-hidden"
        style={{
          background: isActivated ? style.bg.replace("0.07", "0.14").replace("0.05", "0.1").replace("0.08", "0.14") : style.bg,
          border: `1px solid ${isActivated ? node.color + "80" : style.border}`,
          boxShadow: isActivated
            ? `0 2px 16px ${node.color}18, inset 0 1px 0 ${node.color}20`
            : "0 1px 8px rgba(0,0,0,0.3)",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Top color bar */}
        <motion.div
          className="absolute top-0 left-0 right-0"
          style={{ height: 2, background: node.color }}
          animate={{ opacity: isActivated ? 1 : 0.35 }}
          transition={{ duration: 0.3 }}
        />

        {/* Shimmer scan on activation */}
        {isActivated && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${node.color}18 50%, transparent 100%)`,
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear", repeatDelay: 0.6 }}
          />
        )}

        <div className="flex items-center gap-2 h-full px-3">
          {/* Icon */}
          <span
            style={{
              fontSize: iconSize,
              filter: isActivated ? `drop-shadow(0 0 5px ${node.color})` : "none",
              transition: "filter 0.3s ease",
              flexShrink: 0,
            }}
          >
            {node.icon}
          </span>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <div
              className="font-mono font-semibold truncate leading-tight"
              style={{
                fontSize,
                color: node.color,
                textShadow: isActivated ? `0 0 6px ${node.color}` : "none",
                transition: "text-shadow 0.3s ease",
              }}
            >
              {node.label}
            </div>
            <div
              className="font-mono truncate opacity-45 leading-tight mt-0.5"
              style={{ fontSize: subSize, color: node.color }}
            >
              {node.sublabel}
            </div>
          </div>
        </div>

        {/* Right port */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full"
          style={{
            width: Math.max(5, 7 * scale),
            height: Math.max(5, 7 * scale),
            background: isActivated ? node.color : `${node.color}60`,
            boxShadow: isActivated ? `0 0 6px ${node.color}` : "none",
            transition: "background 0.3s ease",
          }}
        />
        {/* Left port */}
        {node.type !== "trigger" && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: Math.max(5, 7 * scale),
              height: Math.max(5, 7 * scale),
              background: isActivated ? node.color : `${node.color}40`,
              boxShadow: isActivated ? `0 0 6px ${node.color}` : "none",
              transition: "background 0.3s ease",
            }}
          />
        )}
      </motion.div>

      {/* Active label above node */}
      {isSelected && (
        <motion.div
          className="absolute font-mono whitespace-nowrap"
          style={{
            bottom: "calc(100% + 6px)",
            left: 0,
            fontSize: Math.max(8, 9 * scale),
            color: node.color,
          }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼ EXECUTING — inspect output →
        </motion.div>
      )}
    </motion.div>
  );
});
