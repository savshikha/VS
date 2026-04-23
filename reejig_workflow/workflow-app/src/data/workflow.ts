export const WORKFLOW_GOAL =
  "Translate business objectives into AI project requirements";

/**
 * First-layer navigation (sample layout): 01–04 workflow explorations.
 */
export const WORKFLOW_DIRECTION_ITERATIONS: {
  id: string;
  versionLine: string;
  title: string;
}[] = [
  { id: "v1", versionLine: "01", title: "Workflow editor" },
  {
    id: "v2",
    versionLine: "02",
    title: "Time or agent optimized",
  },
  {
    id: "v3",
    versionLine: "03",
    title: "What-if optimizer",
  },
];

/** Top portfolio pivot — Background context / Early directions / UI explorations / Final design. */
export const PAGE_PIVOT_SECTIONS: { id: string; label: string }[] = [
  { id: "context", label: "Background context" },
  { id: "directions-explored", label: "Early directions" },
  { id: "ui-explorations", label: "UI explorations" },
  { id: "final-design", label: "Final design" },
];

/** UI explorations (left rail) — order of rows; `explainers` supply titles + body. */
export const UI_EXPLORATION_PIVOT_ITEMS: { id: string }[] = [
  { id: "ui-1" },
  { id: "ui-2" },
  { id: "ui-3" },
];

export const UI_EXPLORATION_EXPLAINERS: Record<
  string,
  { title: string; body: string }
> = {
  "ui-1": {
    title: "Workflow steps",
    body: "The workflow step was a new component, so I tried several layout and treatment options side by side before settling on a direction.",
  },
  "ui-2": {
    title: "Adding Agents",
    body: "Patterns for introducing agents, roles, and handoffs within the workflow.",
  },
  "ui-3": {
    title: "Page Layouts",
    body: "Sketches and comparisons for page structure, rails, and how the editor sits in the app.",
  },
};

export const WORKFLOW_DESIGN_VERSIONS = WORKFLOW_DIRECTION_ITERATIONS;

/** Saved workflow snapshots for the v3 version dropdown (UI state only). */
export const WORKFLOW_SNAPSHOT_OPTIONS: { id: string; label: string }[] = [
  { id: "version-1", label: "Version 1" },
  { id: "draft-a", label: "Draft — timeline focus" },
  { id: "draft-b", label: "Draft — agent mix" },
];

/** Parse labels like "60 mins", "2 hours" into minutes (0 if unknown). */
export function parseStepDurationMinutes(label: string): number {
  const t = label.trim().toLowerCase();
  if (!t) return 0;
  const hourMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)\b/);
  if (hourMatch) return Math.round(parseFloat(hourMatch[1]) * 60);
  const minMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes)\b/);
  if (minMatch) return Math.round(parseFloat(minMatch[1]));
  const num = t.match(/^\s*(\d+)\s*$/);
  if (num) return parseInt(num[1], 10);
  return 0;
}

export function totalPathMinutesForSteps(
  steps: { durationLabel: string }[]
): number {
  return steps.reduce((sum, s) => sum + parseStepDurationMinutes(s.durationLabel), 0);
}

function roundDurationStep(mins: number): number {
  return Math.max(5, Math.round(mins / 5) * 5);
}

/** Shown in Optimize time-range labels (trigger + list) — title-style units. */
function formatApproxDurationMinutes(mins: number): string {
  if (mins <= 0) return "0 Mins";
  if (mins < 60) return mins === 1 ? "1 Min" : `${mins} Mins`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hPart = h === 1 ? "1 Hr" : `${h} Hrs`;
  if (m === 0) return hPart;
  const mPart = m === 1 ? "1 Min" : `${m} Mins`;
  return `${hPart} ${mPart}`;
}

/**
 * Optimize panel time ranges — derived from the current workflow path so
 * labels stay realistic vs calendar-only buckets.
 */
export function getOptimizeTimeRangeOptionsForSteps(
  steps: { durationLabel: string }[]
): { id: string; label: string }[] {
  const total = totalPathMinutesForSteps(steps);

  if (total <= 0) {
    return [
      { id: "plan-1w", label: "1 work week (~40 Hrs)" },
      { id: "plan-2w", label: "2 weeks (~80 Hrs)" },
      { id: "plan-1m", label: "1 month (~160 Hrs)" },
      { id: "plan-q", label: "Quarter (~480 Hrs)" },
    ];
  }

  const tight = roundDurationStep(total * 0.88);
  const buffered = roundDurationStep(total * 1.18);
  const weekCapMins = 5 * 8 * 60;

  const fourth =
    total <= weekCapMins
      ? {
          id: "sprint-week",
          label: `Sprint week (cap ~${formatApproxDurationMinutes(weekCapMins)})`,
        }
      : {
          id: "stretched",
          label: `Stretched plan (~${formatApproxDurationMinutes(roundDurationStep(total * 1.35))})`,
        };

  return [
    {
      id: "path",
      label: `Sequential path (~${formatApproxDurationMinutes(total)})`,
    },
    {
      id: "tight",
      label: `Aggressive (~${formatApproxDurationMinutes(tight)})`,
    },
    {
      id: "buffered",
      label: `With review buffer (~${formatApproxDurationMinutes(buffered)})`,
    },
    fourth,
  ];
}

/** Stakeholders for multi-select in the Optimize panel. */
export const OPTIMIZE_STAKEHOLDER_OPTIONS: { id: string; label: string }[] = [
  { id: "product", label: "Product" },
  { id: "engineering", label: "Engineering" },
  { id: "legal", label: "Legal & compliance" },
  { id: "security", label: "Security" },
  { id: "data", label: "Data & analytics" },
  { id: "executive", label: "Executive sponsor" },
];

/** Agent options for the dropdown (labels aligned with design system naming). */
export const AGENTS: { id: string; label: string }[] = [
  { id: "manual", label: "Select agent" },
  { id: "research", label: "Copilot Researcher" },
  { id: "analyst", label: "Copilot Analyst" },
  { id: "evaluator", label: "Copilot Evaluator" },
  { id: "poc", label: "Copilot Studio" },
  { id: "writer", label: "Copilot365 PowerBI" },
  { id: "orchestrator", label: "Copilot Orchestrator" },
];

export type WorkflowStep = {
  id: string;
  /** Short heading (Figma title row). */
  title: string;
  /** Supporting copy under the title. */
  description: string;
  /** e.g. "60 mins" */
  durationLabel: string;
  agentId: string;
  /** Inserted via + control; use inputs until filled. */
  isNew?: boolean;
};

/** Slightly adjust per-step durations for a post-optimize preview (deterministic per generation). */
export function applyOptimizationJitter(
  steps: WorkflowStep[],
  generation: number
): WorkflowStep[] {
  return steps.map((s, i) => {
    const base = parseStepDurationMinutes(s.durationLabel);
    if (base <= 0) return { ...s };
    const t =
      (((generation * 7919 + i * 104729) % 1000) + 500) / 1500;
    const factor = 0.9 + t * 0.22;
    let next = roundDurationStep(base * factor);
    if (next === base)
      next = roundDurationStep(base * (i % 2 === 0 ? 0.94 : 1.06));
    return { ...s, durationLabel: `${next} mins` };
  });
}

export const INITIAL_STEPS: WorkflowStep[] = [
  {
    id: "wf-1",
    title: "Elicit objectives & success criteria",
    description:
      "Capture strategic outcomes, priorities, and what “success” means for the business before drafting AI requirements.",
    durationLabel: "60 mins",
    agentId: "analyst",
  },
  {
    id: "wf-2",
    title: "Map objectives to measurable KPIs",
    description:
      "Define KPIs or OKRs the AI initiative can influence, with baselines and reporting cadence.",
    durationLabel: "90 mins",
    agentId: "evaluator",
  },
  {
    id: "wf-3",
    title: "Document constraints & readiness",
    description:
      "Record budget, timeline, data quality, compliance, and organizational readiness.",
    durationLabel: "120 mins",
    agentId: "analyst",
  },
  {
    id: "wf-4",
    title: "Frame the AI opportunity & scope",
    description:
      "State which workflows to augment or automate and explicit in-scope / out-of-scope boundaries.",
    durationLabel: "60 mins",
    agentId: "research",
  },
  {
    id: "wf-5",
    title: "Derive functional requirements",
    description:
      "Specify inputs, outputs, quality bars, and acceptance criteria traceable to objectives.",
    durationLabel: "180 mins",
    agentId: "analyst",
  },
  {
    id: "wf-6",
    title: "Derive non-functional requirements",
    description:
      "Cover latency, availability, explainability, auditability, fairness, and safety expectations.",
    durationLabel: "120 mins",
    agentId: "analyst",
  },
  {
    id: "wf-7",
    title: "Prioritize & phase the roadmap",
    description:
      "Define MVP, dependencies, milestones, and risk-reduction sequencing.",
    durationLabel: "90 mins",
    agentId: "orchestrator",
  },
  {
    id: "wf-8",
    title: "Baseline package & stakeholder sign-off",
    description:
      "Freeze the requirements baseline and hand off to design and implementation with approvals.",
    durationLabel: "60 mins",
    agentId: "writer",
  },
];

export function defaultSteps(): WorkflowStep[] {
  return INITIAL_STEPS.map((s) => ({ ...s }));
}

/**
 * Version 2 — optimized for minimum sequential time: specialist agents per
 * step, tighter durations (may deploy more agents). Fewer steps than the full v1 path.
 */
export const INITIAL_STEPS_TIME_OPTIMIZED: WorkflowStep[] = [
  {
    id: "wf-t-1",
    title: "Objectives, KPIs & discovery",
    description:
      "Capture outcomes and measurable KPIs with a fast research-led discovery pass.",
    durationLabel: "45 mins",
    agentId: "research",
  },
  {
    id: "wf-t-2",
    title: "Validate measures & readiness",
    description:
      "Stress-test KPIs and document constraints in a focused evaluation cycle.",
    durationLabel: "45 mins",
    agentId: "evaluator",
  },
  {
    id: "wf-t-3",
    title: "Scope, prototype & requirements slice",
    description:
      "Frame scope and lock a vertical slice with rapid studio feedback.",
    durationLabel: "45 mins",
    agentId: "poc",
  },
  {
    id: "wf-t-4",
    title: "Baseline package & stakeholder sign-off",
    description:
      "Freeze the requirements baseline, narrative, and approvals for handoff.",
    durationLabel: "45 mins",
    agentId: "writer",
  },
];

/**
 * Version 2 — optimized for fewest distinct agents: consolidate work under
 * broader steps (longer clock time, fewer deployments).
 */
export const INITIAL_STEPS_AGENT_OPTIMIZED: WorkflowStep[] = [
  {
    id: "wf-a-1",
    title: "Discovery through functional requirements",
    description:
      "One analyst owns objectives, KPIs, constraints, scope, and functional requirements end-to-end.",
    durationLabel: "360 mins",
    agentId: "analyst",
  },
  {
    id: "wf-a-2",
    title: "Non-functionals, roadmap & phasing",
    description:
      "NFRs, prioritization, and MVP sequencing stay with the same analyst context.",
    durationLabel: "240 mins",
    agentId: "analyst",
  },
  {
    id: "wf-a-3",
    title: "Orchestrate sign-off & handoff",
    description:
      "Stakeholder alignment, baseline freeze, and transition to design—single orchestration touchpoint.",
    durationLabel: "120 mins",
    agentId: "orchestrator",
  },
];

export function createEmptyStep(): WorkflowStep {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  return {
    id: `wf-${id}`,
    title: "",
    description: "",
    durationLabel: "",
    agentId: "manual",
    isNew: true,
  };
}
