"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/lib/hooks";
import Terminal from "./Terminal";
import FilePanel from "./FilePanel";
import OSWindow from "./OSWindow";

export default function DevWorld() {
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
              DEV / TERMINAL
            </div>
            <h1
              className="text-2xl font-bold tracking-tight font-mono"
              style={{ color: theme.primaryColor }}
            >
              BUILDER MODE
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            {["CPU", "RAM"].map((stat) => (
              <div
                key={stat}
                className="px-2 py-1 rounded text-xs font-mono"
                style={{
                  background: `${theme.primaryColor}08`,
                  border: `1px solid ${theme.primaryColor}20`,
                  color: theme.primaryColor,
                  opacity: 0.6,
                }}
              >
                {stat}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Full-screen terminal on mobile */}
        <motion.div
          className="flex-1 min-h-0 px-3 pb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Terminal />
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
            DEV / TERMINAL
          </div>
          <h1
            className="text-3xl font-bold tracking-tight font-mono"
            style={{ color: theme.primaryColor }}
          >
            BUILDER MODE
          </h1>
          <div
            className="text-sm font-mono opacity-50 mt-1"
            style={{ color: theme.primaryColor }}
          >
            system design · code craft · engineering depth
          </div>
        </div>

        <div className="flex items-center gap-2">
          {["CPU 12%", "RAM 4.2G", "NET ↑↓"].map((stat) => (
            <div
              key={stat}
              className="px-3 py-1 rounded text-xs font-mono"
              style={{
                background: `${theme.primaryColor}08`,
                border: `1px solid ${theme.primaryColor}20`,
                color: theme.primaryColor,
                opacity: 0.7,
              }}
            >
              {stat}
            </div>
          ))}
        </div>
      </motion.div>

      {/* OS Layout */}
      <div className="flex-1 flex overflow-hidden px-4 gap-3 min-h-0">
        {/* File Panel */}
        <motion.div
          className="w-48 flex-shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <FilePanel />
        </motion.div>

        {/* Terminal - main */}
        <motion.div
          className="flex-1 min-w-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Terminal />
        </motion.div>

        {/* Info panel */}
        <motion.div
          className="w-56 flex-shrink-0 flex flex-col gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <OSWindow />
        </motion.div>
      </div>
    </div>
  );
}
