"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";

interface FileNode {
  name: string;
  type: "dir" | "file";
  children?: FileNode[];
  ext?: string;
}

const FILE_TREE: FileNode[] = [
  {
    name: "~/hazem",
    type: "dir",
    children: [
      {
        name: "projects",
        type: "dir",
        children: [
          { name: "neural-flow", type: "dir", children: [
            { name: "main.py", type: "file", ext: "py" },
            { name: "agents.py", type: "file", ext: "py" },
          ]},
          { name: "cipher-ui", type: "dir", children: [
            { name: "page.tsx", type: "file", ext: "tsx" },
            { name: "store.ts", type: "file", ext: "ts" },
          ]},
          { name: "phantom-api", type: "dir", children: [
            { name: "main.rs", type: "file", ext: "rs" },
          ]},
        ],
      },
      {
        name: "dotfiles",
        type: "dir",
        children: [
          { name: ".zshrc", type: "file", ext: "sh" },
          { name: ".vimrc", type: "file", ext: "vim" },
          { name: ".tmux.conf", type: "file", ext: "conf" },
        ],
      },
      { name: "manifesto.txt", type: "file", ext: "txt" },
      { name: "readme.md", type: "file", ext: "md" },
      { name: ".secrets", type: "file", ext: "lock" },
    ],
  },
];

const EXT_COLORS: Record<string, string> = {
  py: "#3B82F6",
  tsx: "#60A5FA",
  ts: "#60A5FA",
  rs: "#F97316",
  sh: "#A3E635",
  vim: "#34D399",
  conf: "#94A3B8",
  txt: "#94A3B8",
  md: "#E2E8F0",
  lock: "#FF0040",
};

function FileTreeNode({
  node,
  depth = 0,
  theme,
}: {
  node: FileNode;
  depth?: number;
  theme: { primaryColor: string };
}) {
  const [open, setOpen] = useState(depth < 1);

  const color = node.type === "dir"
    ? theme.primaryColor
    : EXT_COLORS[node.ext || ""] || "#94A3B8";

  return (
    <div>
      <motion.button
        className="flex items-center gap-1.5 w-full text-left py-0.5 px-1 rounded hover:bg-white/5 transition-colors"
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => node.type === "dir" && setOpen((o) => !o)}
        whileHover={{ x: 1 }}
      >
        <span className="text-xs opacity-50" style={{ color }}>
          {node.type === "dir" ? (open ? "▾" : "▸") : "·"}
        </span>
        <span
          className="text-xs font-mono truncate"
          style={{ color, opacity: node.name === ".secrets" ? 0.4 : 0.8 }}
        >
          {node.name}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            {node.children.map((child) => (
              <FileTreeNode
                key={child.name}
                node={child}
                depth={depth + 1}
                theme={theme}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FilePanel() {
  const { theme } = useStore();

  return (
    <div
      className="flex flex-col h-full rounded-lg overflow-hidden font-mono"
      style={{
        background: "rgba(10, 13, 18, 0.85)",
        border: `1px solid ${theme.primaryColor}20`,
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2.5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${theme.primaryColor}15` }}
      >
        <span className="text-xs font-mono tracking-widest opacity-50" style={{ color: theme.primaryColor }}>
          EXPLORER
        </span>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        {FILE_TREE.map((node) => (
          <FileTreeNode key={node.name} node={node} theme={theme} />
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-3 py-2 flex-shrink-0"
        style={{ borderTop: `1px solid ${theme.primaryColor}10` }}
      >
        <div className="text-xs font-mono opacity-20" style={{ color: theme.primaryColor }}>
          5 items
        </div>
      </div>
    </div>
  );
}
