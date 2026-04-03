import { create } from "zustand";

export type World = "ai" | "dev";
export type CursorVariant = "default" | "hover" | "click" | "terminal" | "node";
export type Vibe = "neon" | "minimal" | "cyber";
export type FontChoice = "mono" | "sans" | "display";

export interface Theme {
  primaryColor: string;
  accentColor: string;
  font: FontChoice;
  vibe: Vibe;
}

const VIBES: Record<Vibe, Partial<Theme>> = {
  neon: { primaryColor: "#00FF88", accentColor: "#00D4FF" },
  minimal: { primaryColor: "#E2E8F0", accentColor: "#94A3B8" },
  cyber: { primaryColor: "#B400FF", accentColor: "#FF0040" },
};

interface AppStore {
  world: World;
  isTransitioning: boolean;
  transitionPhase: "idle" | "glitch" | "dissolve" | "reveal";
  theme: Theme;
  cursorVariant: CursorVariant;
  cursorPosition: { x: number; y: number };
  easterEggActivated: boolean;
  easterEggMessage: string;
  themePlaygroundOpen: boolean;
  activeNodeId: string | null;
  executionPath: string[];
  executionEdges: string[];
  terminalOutput: TerminalLine[];
  terminalInput: string;
  scrollProgress: number; // 0 = AI, 1 = DEV

  setWorld: (world: World) => void;
  toggleWorld: () => void;
  triggerTransition: (targetWorld: World) => void;
  setTransitioning: (val: boolean) => void;
  setTransitionPhase: (phase: AppStore["transitionPhase"]) => void;
  setTheme: (theme: Partial<Theme>) => void;
  applyVibe: (vibe: Vibe) => void;
  setCursorVariant: (variant: CursorVariant) => void;
  setCursorPosition: (pos: { x: number; y: number }) => void;
  activateEasterEgg: (message: string) => void;
  dismissEasterEgg: () => void;
  toggleThemePlayground: () => void;
  setActiveNodeId: (id: string | null) => void;
  setExecutionPath: (nodes: string[], edges: string[]) => void;
  addTerminalLine: (line: TerminalLine) => void;
  clearTerminal: () => void;
  setTerminalInput: (input: string) => void;
  setScrollProgress: (p: number) => void;
}

export interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "success" | "system" | "ascii";
  content: string;
  timestamp?: Date;
}

export const useStore = create<AppStore>((set, get) => ({
  world: "ai",
  isTransitioning: false,
  transitionPhase: "idle",
  theme: {
    primaryColor: "#00FF88",
    accentColor: "#00D4FF",
    font: "mono",
    vibe: "neon",
  },
  cursorVariant: "default",
  cursorPosition: { x: 0, y: 0 },
  easterEggActivated: false,
  easterEggMessage: "",
  themePlaygroundOpen: false,
  activeNodeId: null,
  executionPath: [],
  executionEdges: [],
  scrollProgress: 0,
  terminalOutput: [
    { id: "boot-1", type: "system", content: "HAZEM OS v2.4.1 — Booting..." },
    { id: "boot-2", type: "success", content: "[ OK ] Systems initialized" },
    { id: "boot-3", type: "output", content: 'Type "help" to see available commands.' },
  ],
  terminalInput: "",

  setWorld: (world) => set({ world }),

  toggleWorld: () =>
    set((state) => ({ world: state.world === "ai" ? "dev" : "ai" })),

  triggerTransition: (targetWorld) => {
    const state = get();
    if (state.isTransitioning || state.world === targetWorld) return;

    set({ isTransitioning: true, transitionPhase: "glitch" });

    setTimeout(() => set({ transitionPhase: "dissolve" }), 300);

    setTimeout(() => set({ world: targetWorld, transitionPhase: "reveal" }), 750);

    setTimeout(() => {
      set({ isTransitioning: false, transitionPhase: "idle" });
    }, 1300);
  },

  setTransitioning: (val) => set({ isTransitioning: val }),
  setTransitionPhase: (phase) => set({ transitionPhase: phase }),

  setTheme: (theme) =>
    set((state) => ({ theme: { ...state.theme, ...theme } })),

  applyVibe: (vibe) =>
    set((state) => ({ theme: { ...state.theme, ...VIBES[vibe], vibe } })),

  setCursorVariant: (variant) => set({ cursorVariant: variant }),
  setCursorPosition: (pos) => set({ cursorPosition: pos }),

  activateEasterEgg: (message) =>
    set({ easterEggActivated: true, easterEggMessage: message }),

  dismissEasterEgg: () =>
    set({ easterEggActivated: false, easterEggMessage: "" }),

  toggleThemePlayground: () =>
    set((state) => ({ themePlaygroundOpen: !state.themePlaygroundOpen })),

  setActiveNodeId: (id) => set({ activeNodeId: id }),

  setExecutionPath: (nodes, edges) =>
    set({ executionPath: nodes, executionEdges: edges }),

  addTerminalLine: (line) =>
    set((state) => ({
      terminalOutput: [...state.terminalOutput.slice(-100), line],
    })),

  clearTerminal: () => set({ terminalOutput: [] }),
  setTerminalInput: (input) => set({ terminalInput: input }),
  setScrollProgress: (p) => set({ scrollProgress: p }),
}));
