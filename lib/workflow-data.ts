export interface WorkflowNode {
  id: string;
  type: "trigger" | "process" | "api" | "decision" | "output" | "error";
  label: string;
  sublabel: string;
  // Virtual canvas positions (within 820×340 space)
  vx: number;
  vy: number;
  icon: string;
  color: string;
  outputs?: string[];
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface SimulatedOutput {
  nodeId: string;
  title: string;
  content: string;
  type: "json" | "log" | "alert" | "success";
}

// Virtual canvas: 820 × 340
// Node size: 152 × 60
export const VIRTUAL_W = 820;
export const VIRTUAL_H = 340;
export const NODE_W = 152;
export const NODE_H = 60;

export const WORKFLOW_NODES: WorkflowNode[] = [
  {
    id: "trigger-1",
    type: "trigger",
    label: "HTTP Trigger",
    sublabel: "POST /api/process",
    vx: 16,
    vy: 140,
    icon: "⚡",
    color: "#00FF88",
    outputs: ["process-1"],
  },
  {
    id: "process-1",
    type: "process",
    label: "Data Parser",
    sublabel: "JSON → Schema",
    vx: 222,
    vy: 72,
    icon: "⚙",
    color: "#00D4FF",
    outputs: ["api-1", "decision-1"],
  },
  {
    id: "api-1",
    type: "api",
    label: "Claude API",
    sublabel: "AI Analysis",
    vx: 440,
    vy: 16,
    icon: "🧠",
    color: "#B400FF",
    outputs: ["output-1"],
  },
  {
    id: "decision-1",
    type: "decision",
    label: "Validator",
    sublabel: "Schema Check",
    vx: 440,
    vy: 200,
    icon: "◈",
    color: "#FFD700",
    outputs: ["output-1", "error-1"],
  },
  {
    id: "output-1",
    type: "output",
    label: "Response",
    sublabel: "Send Result",
    vx: 654,
    vy: 100,
    icon: "▶",
    color: "#00FF88",
    outputs: [],
  },
  {
    id: "error-1",
    type: "error",
    label: "Error Handler",
    sublabel: "Log & Retry",
    vx: 654,
    vy: 260,
    icon: "⚠",
    color: "#FF0040",
    outputs: [],
  },
];

export const WORKFLOW_EDGES: WorkflowEdge[] = [
  { id: "e1", from: "trigger-1", to: "process-1" },
  { id: "e2", from: "process-1", to: "api-1", label: "route" },
  { id: "e3", from: "process-1", to: "decision-1" },
  { id: "e4", from: "api-1", to: "output-1" },
  { id: "e5", from: "decision-1", to: "output-1", label: "pass" },
  { id: "e6", from: "decision-1", to: "error-1", label: "fail" },
];

// Downstream nodes activated when a node is clicked (in sequence order)
export const DOWNSTREAM_NODES: Record<string, string[]> = {
  "trigger-1":  ["trigger-1", "process-1", "api-1", "decision-1", "output-1", "error-1"],
  "process-1":  ["process-1", "api-1", "decision-1", "output-1", "error-1"],
  "api-1":      ["api-1", "output-1"],
  "decision-1": ["decision-1", "output-1", "error-1"],
  "output-1":   ["output-1"],
  "error-1":    ["error-1"],
};

// Active edges when a node is clicked
export const DOWNSTREAM_EDGES: Record<string, string[]> = {
  "trigger-1":  ["e1", "e2", "e3", "e4", "e5", "e6"],
  "process-1":  ["e2", "e3", "e4", "e5", "e6"],
  "api-1":      ["e4"],
  "decision-1": ["e5", "e6"],
  "output-1":   [],
  "error-1":    [],
};

export const SIMULATED_OUTPUTS: Record<string, SimulatedOutput> = {
  "trigger-1": {
    nodeId: "trigger-1",
    title: "Incoming Request",
    type: "json",
    content: JSON.stringify(
      {
        method: "POST",
        endpoint: "/api/process",
        headers: { "Content-Type": "application/json", Authorization: "Bearer sk-..." },
        body: { input: "Analyze user sentiment", context: "product_feedback", model: "claude-3" },
        timestamp: new Date().toISOString(),
      },
      null,
      2
    ),
  },
  "process-1": {
    nodeId: "process-1",
    title: "Data Parser Output",
    type: "log",
    content: `[INFO] Parsing request body...
[INFO] Schema validation passed
[INFO] Detected: NLP task → routing to AI processor
[INFO] Payload size: 847 bytes
[INFO] Session ID: sess_x9k2m4p
[SUCCESS] Parse complete in 12ms`,
  },
  "api-1": {
    nodeId: "api-1",
    title: "Claude API Response",
    type: "json",
    content: JSON.stringify(
      {
        id: "msg_01Xfg7kMpQ",
        type: "message",
        role: "assistant",
        content: "Sentiment: POSITIVE (confidence: 0.94). Themes: innovation, reliability.",
        model: "claude-3-5-sonnet",
        stop_reason: "end_turn",
        usage: { input_tokens: 142, output_tokens: 38 },
        latency_ms: 340,
      },
      null,
      2
    ),
  },
  "decision-1": {
    nodeId: "decision-1",
    title: "Validation Result",
    type: "success",
    content: `✓ Schema validation: PASSED
✓ Required fields: all present
✓ Data types: correct
✓ Business rules: compliant
✓ Rate limit: within bounds

→ Routing to: output-1 (SUCCESS path)`,
  },
  "output-1": {
    nodeId: "output-1",
    title: "Final Response",
    type: "json",
    content: JSON.stringify(
      {
        status: 200,
        success: true,
        data: {
          sentiment: "positive",
          confidence: 0.94,
          themes: ["innovation", "reliability", "performance"],
          recommendation: "Highlight in marketing materials",
        },
        metadata: { processed_in: "352ms", pipeline: "v2.4.1" },
      },
      null,
      2
    ),
  },
  "error-1": {
    nodeId: "error-1",
    title: "Error Log",
    type: "log",
    content: `[ERROR] Schema validation failed
[ERROR] Missing required field: 'context'
[INFO] Attempting retry (1/3)...
[INFO] Backoff: 500ms
[ERROR] Retry failed
[ALERT] Dead letter queue: activated
[INFO] Incident ID: INC-2847 created
[INFO] On-call notified via PagerDuty`,
  },
};
