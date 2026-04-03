import { TerminalLine } from "./store";

const uid = () => Math.random().toString(36).slice(2, 9);

const ABOUT_TEXT = `
  ██╗  ██╗ █████╗ ███████╗███████╗███╗   ███╗
  ██║  ██║██╔══██╗╚══███╔╝██╔════╝████╗ ████║
  ███████║███████║  ███╔╝ █████╗  ██╔████╔██║
  ██╔══██║██╔══██║ ███╔╝  ██╔══╝  ██║╚██╔╝██║
  ██║  ██║██║  ██║███████╗███████╗██║ ╚═╝ ██║
  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝

  > Full-Stack Engineer  &  AI Systems Architect
  > Building at the intersection of code and intelligence
  > Location: The Digital Frontier
  > Status: Always building something
`;

const PROJECTS = [
  {
    name: "NeuralFlow",
    desc: "AI-powered workflow automation engine",
    tech: "Python · FastAPI · LangChain · Redis",
    status: "● LIVE",
  },
  {
    name: "Cipher UI",
    desc: "Encrypted real-time collaboration platform",
    tech: "Next.js · WebSockets · E2E Encryption",
    status: "● LIVE",
  },
  {
    name: "Phantom API",
    desc: "Zero-latency serverless edge functions",
    tech: "Rust · WASM · Cloudflare Workers",
    status: "◐ IN DEV",
  },
  {
    name: "QuantumDB",
    desc: "Distributed graph database for AI agents",
    tech: "Go · gRPC · Custom B-tree Engine",
    status: "◐ IN DEV",
  },
  {
    name: "Hazem OS",
    desc: "This very interactive experience you're in",
    tech: "Next.js · Framer Motion · Zustand",
    status: "● LIVE",
  },
];

const SKILLS = {
  Languages: ["TypeScript", "Python", "Rust", "Go", "SQL"],
  Frontend: ["React", "Next.js", "Framer Motion", "Three.js", "WebGL"],
  Backend: ["Node.js", "FastAPI", "GraphQL", "gRPC", "WebSockets"],
  AI: ["LangChain", "OpenAI API", "Anthropic Claude", "PyTorch", "Transformers"],
  Infra: ["Docker", "K8s", "Cloudflare", "AWS", "Terraform"],
  Tools: ["n8n", "Supabase", "Redis", "PostgreSQL", "Kafka"],
};

const CONTACT = `
  ┌─────────────────────────────────────────┐
  │           CONTACT HAZEM                  │
  ├─────────────────────────────────────────┤
  │  Email    →  hazem@domain.io            │
  │  GitHub   →  github.com/hazem          │
  │  LinkedIn →  linkedin.com/in/hazem     │
  │  X        →  @hazem_builds             │
  │  Discord  →  hazem#0000                │
  └─────────────────────────────────────────┘

  > Available for freelance & collaboration
  > Response time: < 24 hours
`;

const WHOAMI = `
  {
    "identity": "Hazem",
    "role": "Full-Stack Engineer + AI Architect",
    "mode": "Builder",
    "uptime": "24/7",
    "coffee_dependency": true,
    "currently_listening": "Dark ambient + synthwave",
    "philosophy": "Code is poetry. Systems are art.",
    "secret": "try typing 'matrix' or 'ghost'..."
  }
`;

const HELP_TEXT = `
  ┌────────────────────────────────────────────┐
  │  HAZEM OS — COMMAND REFERENCE              │
  ├────────────────────────────────────────────┤
  │  help        Show this help menu           │
  │  about       Personal introduction         │
  │  whoami      Identity JSON                 │
  │  projects    List all projects             │
  │  skills      Technical skill tree          │
  │  contact     Contact information           │
  │  ls          List system files             │
  │  clear       Clear terminal                │
  │  date        Show current date/time        │
  │  echo [msg]  Echo a message                │
  │  sudo        You know what this does       │
  └────────────────────────────────────────────┘

  > Hint: There are hidden commands...
`;

export const EASTER_EGG_COMMANDS = ["matrix", "ghost", "hazem", "konami", "42", "neo"];

export function processCommand(
  input: string,
  activateEasterEgg: (msg: string) => void,
  clearTerminal: () => void
): TerminalLine[] {
  const trimmed = input.trim().toLowerCase();
  const [cmd, ...args] = trimmed.split(" ");
  const lines: TerminalLine[] = [];

  const out = (content: string, type: TerminalLine["type"] = "output"): TerminalLine => ({
    id: uid(),
    type,
    content,
  });

  switch (cmd) {
    case "help":
      lines.push(out(HELP_TEXT));
      break;

    case "about":
      lines.push(out(ABOUT_TEXT, "ascii"));
      break;

    case "whoami":
      lines.push(out(WHOAMI));
      break;

    case "projects":
      lines.push(out(""));
      lines.push(out("  PROJECTS (" + PROJECTS.length + " found)", "success"));
      lines.push(out("  ─────────────────────────────────────────"));
      PROJECTS.forEach((p, i) => {
        lines.push(out(`  ${i + 1}. ${p.status} ${p.name}`));
        lines.push(out(`     ${p.desc}`));
        lines.push(out(`     Stack: ${p.tech}`, "system"));
        lines.push(out(""));
      });
      break;

    case "skills":
      lines.push(out(""));
      lines.push(out("  SKILL TREE", "success"));
      lines.push(out("  ─────────────────────────────────────────"));
      Object.entries(SKILLS).forEach(([category, items]) => {
        lines.push(out(`  [${category}]`));
        lines.push(out(`    └── ${items.join(" · ")}`));
      });
      lines.push(out(""));
      break;

    case "contact":
      lines.push(out(CONTACT));
      break;

    case "clear":
      clearTerminal();
      return [];

    case "ls":
      lines.push(out(""));
      lines.push(out("  drwxr-xr-x  projects/"));
      lines.push(out("  drwxr-xr-x  thoughts/"));
      lines.push(out("  drwxr-xr-x  experiments/"));
      lines.push(out("  -rw-r--r--  manifesto.txt"));
      lines.push(out("  -rw-r--r--  readme.md"));
      lines.push(out("  -rwx------  .secrets  [REDACTED]", "error"));
      lines.push(out(""));
      break;

    case "cat":
      if (args[0] === "manifesto.txt") {
        lines.push(out(""));
        lines.push(out("  > Build things that matter."));
        lines.push(out("  > Automate the repetitive. Amplify the human."));
        lines.push(out("  > Code is communication — clarity above cleverness."));
        lines.push(out("  > Ship early. Iterate always. Delete the unnecessary."));
        lines.push(out(""));
      } else if (args[0] === "readme.md") {
        lines.push(out("  README: This is Hazem's operating system."));
        lines.push(out("  Navigate worlds. Run commands. Find the truth."));
      } else if (args[0] === ".secrets") {
        lines.push(out("  Permission denied. Nice try.", "error"));
      } else {
        lines.push(out(`  cat: ${args[0] || "(no file)"}: No such file or directory`, "error"));
      }
      break;

    case "date":
      lines.push(out(`  ${new Date().toString()}`));
      break;

    case "echo":
      lines.push(out(`  ${args.join(" ")}`));
      break;

    case "sudo":
      lines.push(out("  [sudo] password for hazem: ", "system"));
      setTimeout(() => {}, 500);
      lines.push(out("  sudo: You are not in the sudoers file.", "error"));
      lines.push(out("  This incident will be reported. (jk)", "system"));
      break;

    case "matrix":
    case "ghost":
    case "neo":
      activateEasterEgg("HIDDEN MODE UNLOCKED: GHOST PROTOCOL ACTIVE");
      lines.push(out("  > INITIATING GHOST PROTOCOL...", "success"));
      lines.push(out("  > DECRYPTING HIDDEN LAYER...", "success"));
      lines.push(out("  > ACCESS GRANTED", "success"));
      break;

    case "hazem":
      activateEasterEgg("YOU FOUND ME. THE REAL HAZEM IS THE SYSTEMS WE BUILT ALONG THE WAY.");
      lines.push(out("  > Hello, I was waiting for someone to type this.", "success"));
      break;

    case "42":
      lines.push(out("  > The answer to life, the universe, and everything.", "success"));
      lines.push(out("  > Also, the number of commits before shipping.", "output"));
      break;

    case "":
      break;

    default:
      lines.push(out(`  bash: ${cmd}: command not found`, "error"));
      lines.push(out(`  Type "help" to see available commands.`, "system"));
  }

  return lines;
}
