"use client";

import { useRef, useEffect, useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import {
  WORKFLOW_NODES,
  WORKFLOW_EDGES,
  DOWNSTREAM_NODES,
  DOWNSTREAM_EDGES,
  VIRTUAL_W,
  VIRTUAL_H,
  NODE_W,
  NODE_H,
} from "@/lib/workflow-data";
import WorkflowNode from "./WorkflowNode";

const CANVAS_PAD = 28;

export default memo(function WorkflowCanvas() {
  const { theme, activeNodeId, setActiveNodeId, setExecutionPath } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.9);
  const [containerSize, setContainerSize] = useState({ w: 760, h: 420 });
  // activatedNodes: nodes that have "received data" in the execution sequence
  const [activatedNodes, setActivatedNodes] = useState<Set<string>>(new Set());
  const timerRefs = useRef<NodeJS.Timeout[]>([]);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const innerH = height - 44; // minus header
      const s = Math.min(
        (width - CANVAS_PAD * 2) / VIRTUAL_W,
        (innerH - CANVAS_PAD * 2) / VIRTUAL_H,
        1
      );
      setScale(Math.max(s, 0.42));
      setContainerSize({ w: width, h: innerH });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Execution sequence cascade
  useEffect(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];

    if (!activeNodeId) {
      setActivatedNodes(new Set());
      setExecutionPath([], []);
      return;
    }

    const path = DOWNSTREAM_NODES[activeNodeId] ?? [activeNodeId];
    const edges = DOWNSTREAM_EDGES[activeNodeId] ?? [];
    setExecutionPath(path, edges);

    // Cascade: activate each node with staggered delay
    setActivatedNodes(new Set([path[0]]));
    path.forEach((id, i) => {
      if (i === 0) return;
      const t = setTimeout(() => {
        setActivatedNodes((prev) => { const s = new Set(prev); s.add(id); return s; });
      }, i * 220);
      timerRefs.current.push(t);
    });

    return () => timerRefs.current.forEach(clearTimeout);
  }, [activeNodeId, setExecutionPath]);

  // Node pixel positions (top-left corner)
  const nodePos = useCallback(
    (node: (typeof WORKFLOW_NODES)[0]) => {
      const offsetX = (containerSize.w - VIRTUAL_W * scale) / 2;
      const offsetY = (containerSize.h - VIRTUAL_H * scale) / 2;
      return {
        x: node.vx * scale + offsetX,
        y: node.vy * scale + offsetY,
      };
    },
    [scale, containerSize]
  );

  // Port positions for SVG edges
  const portPos = useCallback(
    (node: (typeof WORKFLOW_NODES)[0], side: "left" | "right") => {
      const pos = nodePos(node);
      const w = NODE_W * scale;
      const h = NODE_H * scale;
      return {
        x: side === "right" ? pos.x + w : pos.x,
        y: pos.y + h / 2,
      };
    },
    [nodePos, scale]
  );

  const hasActive = activeNodeId !== null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-lg overflow-hidden"
      style={{
        background: "rgba(11, 15, 20, 0.72)",
        border: `1px solid ${theme.primaryColor}18`,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${theme.primaryColor}12` }}
      >
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: `${theme.primaryColor}80` }} />
        </div>
        <span className="text-xs font-mono opacity-35" style={{ color: theme.primaryColor }}>
          workflow.automation — pipeline v2.4
        </span>
        <div className="ml-auto flex items-center gap-3">
          {hasActive && (
            <motion.button
              className="text-xs font-mono opacity-40 hover:opacity-80 transition-opacity"
              style={{ color: theme.primaryColor }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              onClick={() => setActiveNodeId(null)}
              onMouseEnter={() => useStore.getState().setCursorVariant("hover")}
              onMouseLeave={() => useStore.getState().setCursorVariant("default")}
            >
              [reset]
            </motion.button>
          )}
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: theme.primaryColor }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-mono opacity-30" style={{ color: theme.primaryColor }}>
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div className="relative" style={{ height: "calc(100% - 44px)" }}>
        {/* SVG edges layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: "visible" }}
        >
          <defs>
            <marker id="arrow-dim" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0,0 L0,5 L5,2.5 z" fill={`${theme.primaryColor}20`} />
            </marker>
            <marker id="arrow-active" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0,0 L0,5 L5,2.5 z" fill={theme.primaryColor} />
            </marker>
            <filter id="edge-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {WORKFLOW_EDGES.map((edge) => {
            const fromNode = WORKFLOW_NODES.find((n) => n.id === edge.from)!;
            const toNode = WORKFLOW_NODES.find((n) => n.id === edge.to)!;
            const from = portPos(fromNode, "right");
            const to = portPos(toNode, "left");
            const cpX = Math.max(Math.abs(to.x - from.x) * 0.45, 50 * scale);
            const pathD = `M ${from.x} ${from.y} C ${from.x + cpX} ${from.y}, ${to.x - cpX} ${to.y}, ${to.x} ${to.y}`;

            const isEdgeActive =
              hasActive &&
              activatedNodes.has(edge.from) &&
              activatedNodes.has(edge.to);
            const isDimmed = hasActive && !isEdgeActive;

            return (
              <g key={edge.id}>
                {/* Base path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isDimmed ? `${theme.primaryColor}12` : `${theme.primaryColor}45`}
                  strokeWidth={isEdgeActive ? 1.5 : 1}
                  markerEnd={isDimmed ? "url(#arrow-dim)" : "url(#arrow-active)"}
                  style={{ transition: "stroke 0.3s ease, stroke-width 0.3s ease" }}
                />

                {/* Active glow line */}
                {isEdgeActive && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={theme.primaryColor}
                    strokeWidth={1}
                    opacity={0.3}
                    filter="url(#edge-glow)"
                  />
                )}

                {/* Edge label */}
                {edge.label && !isDimmed && (
                  <text
                    x={(from.x + to.x) / 2}
                    y={Math.min(from.y, to.y) - 6}
                    textAnchor="middle"
                    fill={`${theme.primaryColor}50`}
                    fontSize={Math.max(8, 9 * scale)}
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {edge.label}
                  </text>
                )}

                {/* Data packets — multiple, staggered */}
                {isEdgeActive && [0, 0.4, 0.75].map((delay, pi) => (
                  <circle
                    key={pi}
                    r={Math.max(2.5, 3 * scale)}
                    fill={theme.primaryColor}
                    filter="url(#edge-glow)"
                    opacity={0.9}
                  >
                    <animateMotion
                      dur="1.2s"
                      begin={`${delay}s`}
                      repeatCount="indefinite"
                      path={pathD}
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.9;0.9;0"
                      keyTimes="0;0.1;0.8;1"
                      dur="1.2s"
                      begin={`${delay}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {WORKFLOW_NODES.map((node, i) => {
          const pos = nodePos(node);
          const isActivated = activatedNodes.has(node.id);
          const isDimmed = hasActive && !isActivated;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 + 0.2, type: "spring", stiffness: 280, damping: 22 }}
              style={{ position: "absolute", left: pos.x, top: pos.y }}
            >
              <WorkflowNode
                node={node}
                scale={scale}
                isActivated={isActivated}
                isDimmed={isDimmed}
                hasActiveContext={hasActive}
              />
            </motion.div>
          );
        })}

        {/* Empty state hint */}
        <AnimatePresence>
          {!hasActive && (
            <motion.div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-mono"
              style={{ color: theme.primaryColor, opacity: 0.2 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              exit={{ opacity: 0 }}
            >
              click any node to trace execution
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
