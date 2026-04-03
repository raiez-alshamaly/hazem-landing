"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/lib/hooks";
import WorkflowCanvas from "./WorkflowCanvas";
import SimulatedOutput from "./SimulatedOutput";
import MobileWorkflowCards from "./MobileWorkflowCards";

export default function AIWorld() {
  const { theme } = useStore();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="absolute inset-0 flex flex-col pt-12 pb-10">
        {/* Mobile header */}
        <motion.div
          className="px-4 py-3 flex items-center justify-between flex-shrink-0"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <div
              className="text-xs font-mono tracking-[0.4em] opacity-35 mb-0.5"
              style={{ color: theme.primaryColor }}
            >
              AI / AUTOMATION
            </div>
            <h1
              className="text-2xl font-bold tracking-tight font-mono"
              style={{ color: theme.primaryColor }}
            >
              OPERATOR MODE
            </h1>
          </div>
          <div className="flex flex-col items-end gap-1">
            <MobileStatusBadge label="NODES" value="6" color={theme.accentColor} />
            <MobileStatusBadge label="STATUS" value="ACTIVE" color={theme.primaryColor} />
          </div>
        </motion.div>

        {/* Mobile card canvas */}
        <motion.div
          className="flex-1 min-h-0 overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <MobileWorkflowCards />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col pt-12 pb-10">
      {/* Header */}
      <motion.div
        className="px-8 py-4 flex items-end justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <div
            className="text-xs font-mono tracking-[0.5em] opacity-40 mb-1"
            style={{ color: theme.primaryColor }}
          >
            AI / AUTOMATION
          </div>
          <h1
            className="text-3xl font-bold tracking-tight font-mono"
            style={{ color: theme.primaryColor }}
          >
            OPERATOR MODE
          </h1>
          <div
            className="text-sm font-mono opacity-50 mt-1"
            style={{ color: theme.primaryColor }}
          >
            workflow automation · AI integration · systems thinking
          </div>
        </div>

        <div className="flex items-center gap-6">
          <StatusBadge label="WORKFLOW" value="ACTIVE" color={theme.primaryColor} />
          <StatusBadge label="NODES" value="6" color={theme.accentColor} />
          <StatusBadge label="THROUGHPUT" value="847/s" color={theme.primaryColor} />
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden px-4 gap-4 min-h-0">
        {/* Workflow canvas */}
        <motion.div
          className="flex-1 min-w-0"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <WorkflowCanvas />
        </motion.div>

        {/* Output panel */}
        <motion.div
          className="w-80 flex-shrink-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <SimulatedOutput />
        </motion.div>
      </div>
    </div>
  );
}

function StatusBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-right">
      <div className="text-xs font-mono tracking-widest opacity-40" style={{ color }}>
        {label}
      </div>
      <div className="text-sm font-mono font-semibold" style={{ color, textShadow: `0 0 8px ${color}` }}>
        {value}
      </div>
    </div>
  );
}

function MobileStatusBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-right">
      <div className="text-xs font-mono tracking-widest opacity-35" style={{ color }}>
        {label}
      </div>
      <div className="text-xs font-mono font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
