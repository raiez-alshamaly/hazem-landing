"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/lib/hooks";
import { processCommand } from "@/lib/terminal-commands";
import { uid } from "@/lib/utils";

const INTRO_LINES = [
  { text: "Initializing HAZEM OS v2.4.1...", delay: 0, type: "system" },
  { text: "Loading kernel modules............. [OK]", delay: 400, type: "success" },
  { text: "Mounting filesystems............... [OK]", delay: 700, type: "success" },
  { text: "Starting network services.......... [OK]", delay: 1000, type: "success" },
  { text: "Initializing AI subsystems......... [OK]", delay: 1300, type: "success" },
  { text: "", delay: 1500, type: "output" },
  { text: 'Welcome. Type "help" to begin.', delay: 1700, type: "output" },
] as const;

const QUICK_COMMANDS = ["about", "projects", "contact", "skills", "help"];

type LineType = "input" | "output" | "error" | "success" | "system" | "ascii";

export default function Terminal() {
  const { theme, terminalOutput, terminalInput, addTerminalLine, clearTerminal, setTerminalInput, activateEasterEgg } = useStore();
  const setCursorVariant = useStore((s) => s.setCursorVariant);
  const isMobile = useIsMobile();

  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [introComplete, setIntroComplete] = useState(false);
  const [displayedLines, setDisplayedLines] = useState<typeof terminalOutput>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Boot sequence
  useEffect(() => {
    clearTerminal();
    let timeout: NodeJS.Timeout;

    INTRO_LINES.forEach(({ text, delay, type }) => {
      timeout = setTimeout(() => {
        if (text) {
          addTerminalLine({ id: uid(), type: type as LineType, content: text });
        }
      }, delay);
    });

    setTimeout(() => setIntroComplete(true), 2000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync displayed lines
  useEffect(() => {
    setDisplayedLines(terminalOutput);
  }, [terminalOutput]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedLines]);

  const focusInput = () => inputRef.current?.focus();

  const runCommand = (cmd: string) => {
    setCommandHistory((prev) => [cmd, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);
    addTerminalLine({ id: uid(), type: "input", content: `hazem@os:~$ ${cmd}` });
    const results = processCommand(cmd, activateEasterEgg, clearTerminal);
    results.forEach((line) => addTerminalLine(line));
    setTerminalInput("");
    // Brief delay then scroll
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleSubmit = () => {
    if (!terminalInput.trim() && terminalInput !== "") {
      addTerminalLine({ id: uid(), type: "input", content: `hazem@os:~$ ` });
      setTerminalInput("");
      return;
    }
    runCommand(terminalInput.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(newIndex);
      setTerminalInput(commandHistory[newIndex] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setTerminalInput(newIndex === -1 ? "" : commandHistory[newIndex] || "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const cmds = ["help", "about", "whoami", "projects", "skills", "contact", "ls", "clear", "cat", "echo", "date"];
      const match = cmds.find((c) => c.startsWith(terminalInput));
      if (match) setTerminalInput(match);
    } else if (e.key === "c" && e.ctrlKey) {
      addTerminalLine({ id: uid(), type: "system", content: "^C" });
      setTerminalInput("");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      clearTerminal();
    }
  };

  const lineColors: Record<LineType, string> = {
    input: theme.primaryColor,
    output: "#94A3B8",
    error: "#FF0040",
    success: theme.primaryColor,
    system: theme.accentColor,
    ascii: theme.primaryColor,
  };

  // Mobile font sizes
  const outputTextClass = isMobile ? "text-sm leading-relaxed" : "text-xs leading-relaxed";
  const inputTextClass = isMobile ? "text-sm" : "text-xs";

  return (
    <div
      className="flex flex-col h-full rounded-lg overflow-hidden font-mono"
      style={{
        background: "rgba(8, 10, 14, 0.92)",
        border: `1px solid ${theme.primaryColor}25`,
        backdropFilter: "blur(10px)",
      }}
      onClick={focusInput}
      onMouseEnter={() => !isMobile && setCursorVariant("terminal")}
      onMouseLeave={() => !isMobile && setCursorVariant("default")}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${theme.primaryColor}15` }}
      >
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: `${theme.primaryColor}80` }} />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs opacity-40" style={{ color: theme.primaryColor }}>
            {isMobile ? "hazem@os — terminal" : "hazem@os — bash — 80×24"}
          </span>
        </div>
        <button
          className="text-xs opacity-20 hover:opacity-60 active:opacity-80 transition-opacity"
          style={{ color: theme.primaryColor }}
          onClick={(e) => { e.stopPropagation(); clearTerminal(); }}
        >
          clear
        </button>
      </div>

      {/* Output area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5 min-h-0">
        {displayedLines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {line.type === "ascii" ? (
              <pre
                className="leading-tight whitespace-pre"
                style={{ color: lineColors[line.type], fontSize: isMobile ? 11 : 10 }}
              >
                {line.content}
              </pre>
            ) : (
              <div
                className={`${outputTextClass} whitespace-pre-wrap`}
                style={{ color: lineColors[line.type] }}
              >
                {line.content}
              </div>
            )}
          </motion.div>
        ))}

        {/* Input line — desktop only (mobile uses bottom send bar) */}
        {introComplete && !isMobile && (
          <div className="flex items-center gap-0 mt-1">
            <span className={inputTextClass} style={{ color: theme.primaryColor }}>
              hazem@os:~$&nbsp;
            </span>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`bg-transparent outline-none border-none ${inputTextClass} w-full caret-transparent`}
                style={{ color: theme.primaryColor, fontFamily: "inherit" }}
                spellCheck={false}
                autoComplete="off"
                autoFocus
              />
              {/* Visible cursor */}
              <span
                className="inline-block absolute pointer-events-none"
                style={{
                  left: `${terminalInput.length}ch`,
                  top: 0,
                  width: "0.6em",
                  height: "1.2em",
                  background: theme.primaryColor,
                  animation: "blink 1s step-end infinite",
                }}
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick commands (mobile only) */}
      {isMobile && (
        <div
          className="flex gap-2 px-3 py-2.5 overflow-x-auto flex-shrink-0"
          style={{ borderTop: `1px solid ${theme.primaryColor}12` }}
        >
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono active:scale-95 transition-transform"
              style={{
                background: `${theme.primaryColor}10`,
                border: `1px solid ${theme.primaryColor}28`,
                color: theme.primaryColor,
              }}
              onClick={(e) => {
                e.stopPropagation();
                runCommand(cmd);
                if (navigator.vibrate) navigator.vibrate(8);
              }}
            >
              {cmd}
            </button>
          ))}
        </div>
      )}

      {/* Mobile send row */}
      {isMobile && introComplete && (
        <div
          className="flex items-center gap-2 px-3 pb-2 flex-shrink-0"
        >
          <span className="text-sm font-mono opacity-40" style={{ color: theme.primaryColor }}>
            $
          </span>
          <input
            className="flex-1 bg-transparent outline-none border-none text-sm font-mono"
            style={{
              color: theme.primaryColor,
              fontFamily: "inherit",
            }}
            placeholder="enter command..."
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            inputMode="text"
            enterKeyHint="send"
          />
          <button
            className="px-4 py-2 rounded-lg text-sm font-mono active:scale-95 transition-transform"
            style={{
              background: theme.primaryColor,
              color: "#0B0F14",
              fontWeight: 600,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleSubmit();
              if (navigator.vibrate) navigator.vibrate(8);
            }}
          >
            RUN
          </button>
        </div>
      )}

      {/* Status bar (desktop only) */}
      {!isMobile && (
        <div
          className="px-4 py-1.5 flex items-center justify-between flex-shrink-0"
          style={{ borderTop: `1px solid ${theme.primaryColor}10` }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs opacity-20" style={{ color: theme.primaryColor }}>
              bash 5.2.0
            </span>
            <span className="text-xs opacity-20" style={{ color: theme.primaryColor }}>|</span>
            <span className="text-xs opacity-20" style={{ color: theme.primaryColor }}>
              UTF-8
            </span>
          </div>
          <span className="text-xs opacity-20" style={{ color: theme.primaryColor }}>
            ↑↓ history · TAB complete
          </span>
        </div>
      )}
    </div>
  );
}
