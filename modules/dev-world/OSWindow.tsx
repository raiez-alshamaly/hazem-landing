"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";

interface ProcessItem {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
}

const INITIAL_PROCESSES: ProcessItem[] = [
  { pid: 1, name: "hazem-core", cpu: 0.2, mem: 142 },
  { pid: 342, name: "ai-engine", cpu: 4.1, mem: 512 },
  { pid: 891, name: "api-worker", cpu: 1.8, mem: 88 },
  { pid: 1204, name: "ws-server", cpu: 0.4, mem: 64 },
  { pid: 2041, name: "cache-sync", cpu: 0.1, mem: 32 },
];

const ACTIVITY_LOG = [
  "Build pipeline triggered",
  "Deploy: staging → prod",
  "AI agent initialized",
  "Webhook received",
  "Cache invalidated",
  "Model inference done",
  "Auth token refreshed",
  "DB connection pooled",
];

export default function OSWindow() {
  const { theme } = useStore();
  const [processes, setProcesses] = useState(INITIAL_PROCESSES);
  const [logs, setLogs] = useState<string[]>([]);
  const [tick, setTick] = useState(0);

  // Simulate live process updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProcesses((prev) =>
        prev.map((p) => ({
          ...p,
          cpu: Math.max(0, p.cpu + (Math.random() - 0.5) * 1.5),
          mem: Math.max(10, p.mem + Math.floor((Math.random() - 0.5) * 8)),
        }))
      );
      setTick((t) => t + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Simulate activity log
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLog = `[${new Date().toLocaleTimeString("en-US", { hour12: false })}] ${
          ACTIVITY_LOG[Math.floor(Math.random() * ACTIVITY_LOG.length)]
        }`;
        return [newLog, ...prev].slice(0, 6);
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const totalCpu = processes.reduce((s, p) => s + p.cpu, 0);
  const totalMem = processes.reduce((s, p) => s + p.mem, 0);

  return (
    <>
      {/* Process monitor */}
      <div
        className="flex-1 rounded-lg overflow-hidden font-mono"
        style={{
          background: "rgba(10, 13, 18, 0.85)",
          border: `1px solid ${theme.primaryColor}20`,
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="px-3 py-2.5"
          style={{ borderBottom: `1px solid ${theme.primaryColor}15` }}
        >
          <span className="text-xs tracking-widest opacity-50" style={{ color: theme.primaryColor }}>
            PROCESSES
          </span>
        </div>

        {/* Stats bars */}
        <div className="px-3 py-2 space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1 opacity-60" style={{ color: theme.primaryColor }}>
              <span>CPU</span>
              <span>{totalCpu.toFixed(1)}%</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: `${theme.primaryColor}15` }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: theme.primaryColor }}
                animate={{ width: `${Math.min(totalCpu * 4, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1 opacity-60" style={{ color: theme.primaryColor }}>
              <span>MEM</span>
              <span>{(totalMem / 1024).toFixed(1)}G</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: `${theme.primaryColor}15` }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: theme.accentColor }}
                animate={{ width: `${Math.min(totalMem / 20, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Process list */}
        <div className="px-3 pb-2 space-y-1">
          {processes.map((p) => (
            <div key={p.pid} className="flex items-center gap-2">
              <span className="text-xs opacity-30 w-8 text-right" style={{ color: theme.primaryColor }}>
                {p.pid}
              </span>
              <span className="text-xs flex-1 truncate opacity-70" style={{ color: theme.primaryColor }}>
                {p.name}
              </span>
              <span
                className="text-xs w-10 text-right"
                style={{
                  color: p.cpu > 5 ? "#FF0040" : theme.primaryColor,
                  opacity: 0.6,
                }}
              >
                {p.cpu.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity log */}
      <div
        className="rounded-lg overflow-hidden font-mono"
        style={{
          background: "rgba(10, 13, 18, 0.85)",
          border: `1px solid ${theme.primaryColor}20`,
          backdropFilter: "blur(10px)",
          height: "160px",
        }}
      >
        <div
          className="px-3 py-2.5"
          style={{ borderBottom: `1px solid ${theme.primaryColor}15` }}
        >
          <span className="text-xs tracking-widest opacity-50" style={{ color: theme.primaryColor }}>
            ACTIVITY
          </span>
        </div>
        <div className="px-3 py-2 space-y-1 overflow-hidden">
          {logs.length === 0 ? (
            <div className="text-xs opacity-20 italic" style={{ color: theme.primaryColor }}>
              waiting for events...
            </div>
          ) : (
            logs.map((log, i) => (
              <motion.div
                key={log + i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: i === 0 ? 0.8 : 0.3 }}
                className="text-xs leading-tight truncate"
                style={{ color: theme.primaryColor, fontSize: "9px" }}
              >
                {log}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
