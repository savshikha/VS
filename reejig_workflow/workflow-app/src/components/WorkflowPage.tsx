import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS as DndTransform } from "@dnd-kit/utilities";
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Compass,
  Copy,
  GripVertical,
  LayoutGrid,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AgentIcon } from "@/components/AgentIcon";
import { WF_FIGMA } from "@/components/wf-v4-final-design/mcpFigmaIconUrls";
import { FinalDesignLaptopScreen } from "@/components/wf-v4-final-design/FinalDesignLaptopScreen";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DirectionsExploredPivotRail,
  type DirectionPivotTag,
} from "@/components/DirectionsExploredPivotRail";
import { UiExplorationsPivotRail } from "@/components/UiExplorationsPivotRail";
import { UiStepVariationsGrid } from "@/components/ui-explorations/UiStepVariationsGrid";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AGENTS,
  INITIAL_STEPS_AGENT_OPTIMIZED,
  INITIAL_STEPS_TIME_OPTIMIZED,
  OPTIMIZE_STAKEHOLDER_OPTIONS,
  PAGE_PIVOT_SECTIONS,
  UI_EXPLORATION_EXPLAINERS,
  WORKFLOW_DIRECTION_ITERATIONS,
  WORKFLOW_SNAPSHOT_OPTIONS,
  applyOptimizationJitter,
  createEmptyStep,
  defaultSteps,
  getOptimizeTimeRangeOptionsForSteps,
  type WorkflowStep,
} from "@/data/workflow";
import { cn } from "@/lib/utils";

function newStepId() {
  return `wf-${
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }`;
}

type StepDraftSnapshot = Pick<
  WorkflowStep,
  "title" | "description" | "durationLabel" | "agentId"
>;

function snapshotStep(s: WorkflowStep): StepDraftSnapshot {
  return {
    title: s.title,
    description: s.description,
    durationLabel: s.durationLabel,
    agentId: s.agentId,
  };
}

function isSameDraft(a: StepDraftSnapshot, b: StepDraftSnapshot) {
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.durationLabel === b.durationLabel &&
    a.agentId === b.agentId
  );
}

/** Parse duration labels like "60 mins", "2 hours" into minutes. */
function parseDurationMinutes(label: string): number {
  const t = label.trim().toLowerCase();
  if (!t) return 0;
  const hourMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)\b/);
  if (hourMatch) return Math.round(parseFloat(hourMatch[1]) * 60);
  const minMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes)?\b/);
  if (minMatch) return Math.round(parseFloat(minMatch[1]));
  const num = t.match(/^\s*(\d+)\s*$/);
  if (num) return parseInt(num[1], 10);
  return 0;
}

function formatTotalMinutes(total: number): string {
  if (total <= 0) return "0 min";
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Figma node 1:9461 — “Time taken” copy uses “mins”. */
function formatTimeTakenLabel(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0 mins";
  if (totalMinutes < 60) {
    return totalMinutes === 1 ? "1 min" : `${totalMinutes} mins`;
  }
  return formatTotalMinutes(totalMinutes);
}

/** Version 1 — show duration as whole hours only (no minutes). */
function formatTimeTakenHoursOnly(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0 h";
  const h = Math.round(totalMinutes / 60);
  return h === 1 ? "1 h" : `${h} h`;
}

function useWorkflowStats(
  steps: WorkflowStep[],
  timeTakenHoursOnly = false
) {
  return useMemo(() => {
    const n = steps.length;
    const withAgent = steps.filter((s) => s.agentId && s.agentId !== "manual")
      .length;
    const aiPotentialPct =
      n === 0 ? 0 : Math.round((withAgent / n) * 100);
    const totalMinutes = steps.reduce(
      (sum, s) => sum + parseDurationMinutes(s.durationLabel),
      0
    );
    const distinctIds = [
      ...new Set(
        steps.map((s) => s.agentId).filter((id) => id && id !== "manual")
      ),
    ];
    const firstAgentId = distinctIds[0];
    const firstAgentLabel = firstAgentId
      ? AGENTS.find((a) => a.id === firstAgentId)?.label ?? firstAgentId
      : "";
    const othersCount = Math.max(0, distinctIds.length - 1);
    return {
      aiPotentialPct,
      timeLabel: timeTakenHoursOnly
        ? formatTimeTakenHoursOnly(totalMinutes)
        : formatTimeTakenLabel(totalMinutes),
      firstAgentId,
      firstAgentLabel,
      othersCount,
    };
  }, [steps, timeTakenHoursOnly]);
}

function DetailAccentRow({
  className,
  accentClass,
  children,
}: {
  className?: string;
  accentClass: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex items-stretch gap-4", className)}>
      <div
        className={cn(
          "w-1 shrink-0 self-stretch rounded-[2px]",
          accentClass
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** Stat column titles (v1 / v2 / v3), v3 “Mark as active”, v3 Optimize filter labels. */
const workflowStatHeaderLabelClass =
  "text-[16px] font-normal leading-[1.2] text-[#18174d]";

/** Details card — three stats in one horizontal row (stacked on very narrow viewports). */
function WorkflowDetailsPanel({
  steps,
  variant = "panel",
  extraGapBeforeAgents = false,
  statsDensity = "default",
  timeTakenHoursOnly = false,
  tightEmbeddedStatsGap = false,
}: {
  steps: WorkflowStep[];
  /** `embedded` drops the inner card shell (Version 2: stats live in the workflow column only). */
  variant?: "panel" | "embedded";
  /** Extra 12px before the AI agents column (time-optimized v2 stats row). */
  extraGapBeforeAgents?: boolean;
  /** Tighter gaps between the three stats (v3 wide card — match v1 feel). */
  statsDensity?: "default" | "compact";
  /** Version 1 standard workflow: show “Time taken” as whole hours only. */
  timeTakenHoursOnly?: boolean;
  /** Embedded only: less margin under stats, closer to steps (workflow editor v1). */
  tightEmbeddedStatsGap?: boolean;
}) {
  const {
    aiPotentialPct,
    timeLabel,
    firstAgentLabel,
    othersCount,
    firstAgentId,
  } = useWorkflowStats(steps, timeTakenHoursOnly);

  const statsRow = (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:flex-wrap sm:items-stretch",
        statsDensity === "compact"
          ? "gap-4 sm:gap-x-6 sm:gap-y-4 lg:gap-x-8 lg:gap-y-4"
          : "gap-5 sm:gap-6 lg:gap-8"
      )}
    >
          {/* AI potential — cyan bar (narrower than equal thirds so agents can breathe) */}
          <DetailAccentRow
            className="min-w-0 w-full sm:w-auto sm:shrink-0 sm:basis-auto sm:flex-none"
            accentClass="bg-[#1e83ad]"
          >
            <div className="flex flex-col gap-1">
              <p className={workflowStatHeaderLabelClass}>
                AI potential
              </p>
              <div className="flex items-center gap-[5px]">
                <span className="flex size-[32.5px] shrink-0 items-center justify-center rounded-full bg-[#e5f7ff]">
                  <img
                    alt=""
                    className="max-h-[17px] max-w-[17px] shrink-0 object-contain"
                    src={WF_FIGMA.statsPieChartPage}
                    decoding="async"
                  />
                </span>
                <p className="text-2xl font-bold leading-none whitespace-nowrap text-[#18174d]">
                  {aiPotentialPct}%
                </p>
              </div>
            </div>
          </DetailAccentRow>

          {/* Time taken — orange bar */}
          <DetailAccentRow
            className="min-w-0 w-full sm:w-auto sm:shrink-0 sm:basis-auto sm:flex-none sm:min-w-min"
            accentClass="bg-[#d47b4e]"
          >
            <div className="flex flex-col gap-1">
              <p className={workflowStatHeaderLabelClass}>
                Time taken
              </p>
              <div className="flex items-center gap-[5px]">
                <span className="flex size-[32.5px] shrink-0 items-center justify-center rounded-full bg-[#fff2ec]">
                  <img
                    alt=""
                    className="max-h-[17px] max-w-[17px] shrink-0 object-contain"
                    src={WF_FIGMA.statsHourglassPage}
                    decoding="async"
                  />
                </span>
                <p className="text-2xl font-bold leading-none whitespace-nowrap text-[#18174d]">
                  {timeLabel}
                </p>
              </div>
            </div>
          </DetailAccentRow>

          {/* AI agents — neutral bar */}
          <DetailAccentRow
            className={cn(
              "min-w-0 w-full sm:min-w-0 sm:w-auto sm:flex-1 sm:basis-0 sm:shrink",
              extraGapBeforeAgents && "sm:ml-[12px]"
            )}
            accentClass="bg-[#808094]"
          >
            <div className="flex flex-col gap-1">
              <p className={workflowStatHeaderLabelClass}>
                AI agents
              </p>
              <div className="flex items-center gap-2.5">
                <span className="flex size-[39px] shrink-0 items-center justify-center self-center rounded-full bg-white p-[6.635px]">
                  {firstAgentId ? (
                    <AgentIcon
                      agentId={firstAgentId}
                      className="size-[19.5px] [&_svg]:block [&_img]:block"
                    />
                  ) : (
                    <span className="text-[10px] text-[#808094]">—</span>
                  )}
                </span>
                <div className="min-w-0 flex flex-1 flex-wrap content-center items-center gap-x-1 text-[13.593px] leading-snug">
                  {firstAgentLabel ? (
                    <>
                      <span className="font-semibold text-[#18174d]">
                        {firstAgentLabel}
                      </span>
                      {othersCount > 0 ? (
                        <>
                          <span className="font-normal text-[#18174d]">
                            and
                          </span>
                          <span className="font-normal text-[#4f4bff]">
                            {othersCount === 1
                              ? "1 other"
                              : `${othersCount} others`}
                          </span>
                        </>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-[#808094]">No agents selected</span>
                  )}
                </div>
              </div>
            </div>
          </DetailAccentRow>
    </div>
  );

  if (variant === "embedded") {
    return (
      <div
        className={cn(
          "w-full min-w-0 text-left",
          tightEmbeddedStatsGap ? "mb-2" : "mb-5"
        )}
        role="region"
        aria-label="Workflow statistics"
      >
        {statsRow}
      </div>
    );
  }

  return (
    <div
      className="mb-5 w-full min-w-0 rounded-2xl border border-[#e6e6ea] bg-[#F7F7F8] p-6"
      role="region"
      aria-label="Workflow statistics"
    >
      {statsRow}
    </div>
  );
}

type AgentScopeMode = "company" | "all";

type PivotSectionId =
  | "context"
  | "directions-explored"
  | "ui-explorations"
  | "final-design";

/** v1 / v2 / v3: same max width (stats, steps; v3 includes version bar + reoptimize state). */
const directionsExploredWorkflowColumnClass =
  "mx-auto w-full min-w-0 max-w-[min(100%,34rem)]";

/**
 * v2 — grey card around each workflow. caps both columns: 34rem content + horizontal padding.
 * Pair v2 two-column grid with `minmax(0,1fr)` so one path’s min-content cannot widen that track only.
 */
const workflowV2PanelWidthClass =
  "w-full min-w-0 max-w-[min(100%,38rem)] justify-self-center";

const DIRECTION_EXPLAINERS: Record<
  string,
  { title: string; body: string; tags?: DirectionPivotTag[] }
> = {
  v1: {
    title: "Workflow editor",
    body: "Reorder steps, edit copy, and assign agents. A simple editor for a standard path.",
    tags: [
      { kind: "pro", label: "Drag to reorder" },
      { kind: "pro", label: "Quick to scan" },
      { kind: "pro", label: "Less time spent" },
      { kind: "con", label: "Single path" },
    ],
  },
  v2: {
    title: "Time or agent optimized",
    body: "Keeping the same agent can reduce cost but increase time, while using different agents can increase cost but save time on the workflow overall.",
    tags: [
      { kind: "pro", label: "See both paths" },
      { kind: "pro", label: "Tradeoff obvious" },
      { kind: "con", label: "Wide layout" },
      { kind: "con", label: "Dual upkeep" },
    ],
  },
  v3: {
    title: "What-if optimizer",
    body: "Adjust time range and stakeholders, run a pass, then save when it feels right.",
    tags: [
      { kind: "pro", label: "Try then commit" },
      { kind: "pro", label: "Named versions" },
      { kind: "con", label: "More controls" },
      { kind: "con", label: "Steeper at first" },
    ],
  },
};

/**
 * One line under the version explainer, above the main workflow (same treatment as the v2 subhead).
 */
const WORKFLOW_DIRECTION_INTRO_LINE: Record<"v1" | "v2" | "v3", string> = {
  v1: "Auto-generated standard path—edit below.",
  v2: "Time or agent-optimized, side by side.",
  v3: "Tweak, reoptimize, save a version.",
};

const optimizeSelectTriggerClass =
  "flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#e6e6ea] bg-white px-3 text-left text-[14px] text-[#18174d] shadow-none outline-none transition-colors hover:border-[#c8c6e8] focus-visible:border-[#4f4bff] focus-visible:ring-2 focus-visible:ring-[#4f4bff]/25 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[#494959]";

/** v3 Optimize title + workflow snapshot dropdown — same size & weight. */
const workflowV3VersionTriggerClass =
  "text-[18px] font-bold leading-tight text-[#18174d] md:text-[20px]";

/** v3 faint grey shell — Optimize box + workflow column; `px-8 py-6` matches v2 `workflowV2CardClass`. */
const workflowV3FaintPanelClass =
  "min-w-0 rounded-2xl border border-[#e6e6ea] bg-[#F7F7F8] px-8 py-6 shadow-none";

/** v4 — laptop bezel; inner screen is `FinalDesignLaptopScreen`. */
function WorkflowVersionFourLaptopFrame() {
  return (
    <div
      className="mx-auto w-full max-w-[min(98rem,calc(100vw-1rem))] px-1 sm:px-2"
      aria-label="Laptop preview"
    >
      <div className="rounded-[1.35rem] border-2 border-black/20 bg-gradient-to-b from-[#4a4d63] via-[#353848] to-[#282a38] p-3 shadow-[0_28px_56px_rgba(0,0,0,0.4)] sm:p-5 lg:p-6">
        <div className="mb-2 flex justify-center sm:mb-3">
          <span
            className="h-1.5 w-2 rounded-full bg-black/35"
            aria-hidden
          />
        </div>
        <div className="rounded-xl border border-black/50 bg-[#0a0a0f] p-2 shadow-[inset_0_2px_8px_rgba(0,0,0,0.65)] sm:p-3 lg:p-3.5">
          <div
            className="flex h-[min(90vh,1080px)] w-full flex-col overflow-hidden rounded-lg bg-[#12151f] ring-1 ring-inset ring-white/[0.06]"
            data-wf-v4-laptop-screen
          >
            <div className="min-h-0 flex-1 overflow-hidden rounded-[inherit]">
              <FinalDesignLaptopScreen workflowEditing />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-[94%] max-w-[min(92rem,100%)] flex-col items-center">
        <div className="h-4 w-full rounded-b-2xl border border-t-0 border-black/25 bg-gradient-to-b from-[#3a3d4f] to-[#232530] shadow-lg sm:h-5" />
        <div
          className="mt-2 h-1.5 w-[30%] max-w-[180px] rounded-full bg-black/25"
          aria-hidden
        />
      </div>
    </div>
  );
}

/** Optimize panel — v3 only: time range, stakeholders, agent type, actions. */
function WorkflowV3OptimizePanel({
  timeRangeId,
  timeRangeOptions,
  onTimeRangeChange,
  stakeholderIds,
  onStakeholderToggle,
  agentScope,
  onAgentScopeChange,
  onOptimize,
  onSaveNew,
  optimizeDisabled,
  saveDisabled,
}: {
  timeRangeId: string;
  timeRangeOptions: { id: string; label: string }[];
  onTimeRangeChange: (id: string) => void;
  stakeholderIds: string[];
  onStakeholderToggle: (id: string, nextChecked: boolean) => void;
  agentScope: AgentScopeMode;
  onAgentScopeChange: (mode: AgentScopeMode) => void;
  onOptimize: () => void;
  onSaveNew: () => void;
  optimizeDisabled?: boolean;
  saveDisabled?: boolean;
}) {
  const totalStakeholders = OPTIMIZE_STAKEHOLDER_OPTIONS.length;
  const optimizePanelTitleId = useId();

  const stakeholderSummary = useMemo(() => {
    if (stakeholderIds.length === 0) return "Select stakeholders";
    if (stakeholderIds.length === totalStakeholders) return "All stakeholders";
    const labels = stakeholderIds
      .map((id) => OPTIMIZE_STAKEHOLDER_OPTIONS.find((o) => o.id === id)?.label)
      .filter(Boolean) as string[];
    const joined = labels.join(", ");
    return joined.length > 42 ? `${labels.length} selected` : joined;
  }, [stakeholderIds, totalStakeholders]);

  return (
    <aside
      className="h-min w-full max-w-[280px] shrink-0 self-start lg:sticky lg:top-0"
      aria-labelledby={optimizePanelTitleId}
    >
      <div className={workflowV3FaintPanelClass}>
        <div className="space-y-5">
          <h2
            id={optimizePanelTitleId}
            className={workflowV3VersionTriggerClass}
          >
            Optimize
          </h2>
          <div className="space-y-2">
            <Label
              htmlFor="optimize-time-range"
              className={workflowStatHeaderLabelClass}
            >
              Time range
            </Label>
            <Select
              value={timeRangeId}
              onValueChange={(v) => v && onTimeRangeChange(v)}
            >
              <SelectTrigger
                id="optimize-time-range"
                className={optimizeSelectTriggerClass}
              >
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                align="start"
                sideOffset={4}
                alignItemWithTrigger={false}
                collisionAvoidance={{ side: "none" }}
              >
                {timeRangeOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className={workflowStatHeaderLabelClass}>
              Stakeholders
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                className={optimizeSelectTriggerClass}
                aria-label="Choose stakeholders"
              >
                <span className="min-w-0 flex-1 truncate">
                  {stakeholderSummary}
                </span>
                <ChevronDown className="shrink-0" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[min(100vw-2rem,280px)] max-h-72 overflow-y-auto"
              >
                {OPTIMIZE_STAKEHOLDER_OPTIONS.map((o) => (
                  <DropdownMenuCheckboxItem
                    key={o.id}
                    checked={stakeholderIds.includes(o.id)}
                    onCheckedChange={(checked) =>
                      onStakeholderToggle(o.id, checked === true)
                    }
                  >
                    {o.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            <Label className={workflowStatHeaderLabelClass}>
              Agent type
            </Label>
            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  name="agent-scope"
                  className="size-4 shrink-0 accent-[#4f4bff]"
                  checked={agentScope === "company"}
                  onChange={() => onAgentScopeChange("company")}
                />
                <span className="text-[14px] leading-snug text-[#18174d]">
                  Company provided
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  name="agent-scope"
                  className="size-4 shrink-0 accent-[#4f4bff]"
                  checked={agentScope === "all"}
                  onChange={() => onAgentScopeChange("all")}
                />
                <span className="text-[14px] leading-snug text-[#18174d]">
                  All
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              size="lg"
              disabled={optimizeDisabled}
              className="h-10 w-full rounded-xl border-0 bg-[#4f4bff] text-[14px] font-medium text-white shadow-none hover:bg-[#3d3ae6] focus-visible:ring-2 focus-visible:ring-[#4f4bff]/40 disabled:opacity-60"
              onClick={onOptimize}
            >
              Optimize
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              disabled={saveDisabled}
              className="h-10 w-full rounded-xl border-[#e6e6ea] bg-white text-[14px] font-medium text-[#18174d] shadow-none hover:bg-[#f7f7f8] disabled:opacity-60"
              onClick={onSaveNew}
            >
              Save new
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MarkAsActiveToggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex shrink-0 items-center gap-2.5">
      <Label
        htmlFor={id}
        className={cn(
          "cursor-pointer whitespace-nowrap",
          workflowStatHeaderLabelClass
        )}
      >
        Mark as active
      </Label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f4bff]/35 focus-visible:ring-offset-2",
          checked ? "bg-[#4f4bff]" : "bg-[#d8d8e0]"
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
            checked && "translate-x-5"
          )}
          aria-hidden
        />
      </button>
    </div>
  );
}

/** Icons aligned to section meaning (replaces a single icon for all tabs). */
const PIVOT_SECTION_ICONS: Record<string, LucideIcon> = {
  context: BookOpen,
  "directions-explored": Compass,
  "ui-explorations": LayoutGrid,
  "final-design": CheckCircle2,
};

/** Top pivot — Background context, Early directions, UI explorations, Final design. */
function WorkflowPortfolioPivotNav({
  activeId,
  onSelect,
}: {
  activeId: PivotSectionId;
  onSelect: (id: PivotSectionId) => void;
}) {
  return (
    <nav
      className="w-full overflow-x-auto pb-1 [scrollbar-width:thin]"
      aria-label="Portfolio sections"
    >
      <ul className="flex min-w-0 flex-nowrap items-stretch gap-1 rounded-full border border-[#2f2d5c] bg-[#18174d] p-1 shadow-[0px_4px_12px_rgba(24,23,77,0.35)]">
        {PAGE_PIVOT_SECTIONS.map((s) => {
          const active = activeId === s.id;
          const SectionIcon = PIVOT_SECTION_ICONS[s.id] ?? LayoutGrid;
          return (
            <li
              key={s.id}
              className="flex min-w-[min(100%,6.25rem)] shrink-0 flex-1 sm:min-w-28"
            >
              <button
                type="button"
                aria-current={active ? "true" : undefined}
                onClick={() => onSelect(s.id as PivotSectionId)}
                className={cn(
                  "flex w-full min-h-[2.5rem] items-center gap-1 rounded-full px-2 py-1.5 text-left transition-colors sm:min-h-[2.75rem] sm:gap-1.5 sm:px-2.5",
                  active
                    ? "bg-[#4f4bff] text-white shadow-[0_2px_10px_rgba(79,75,255,0.45)]"
                    : "text-[#c4c2f0] hover:bg-white/5 hover:text-white"
                )}
              >
                <SectionIcon
                  className={cn(
                    "size-[18px] shrink-0",
                    active ? "text-white/95" : "text-[#6b6990]"
                  )}
                  strokeWidth={2}
                  aria-hidden
                />
                <span
                  className={cn(
                    "min-w-0 text-[12px] leading-snug sm:text-[13px] font-workflow-chrome tracking-tight",
                    active ? "font-bold" : "font-medium"
                  )}
                >
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Early directions tab layout — explainer above UI; sits on the same page grid as other tabs. */
function WorkflowExploreShell({
  subNavItems = [],
  subNavId,
  onSubNavChange,
  explainerTitle,
  explainerBody,
  children,
  mainContentZoom,
  /** On md+, hide the pill row + explainer (e.g. when the left rail shows them). */
  hidePreambleOnMd = false,
  /** Hide explainer (title + body) at all breakpoints, e.g. step grid with rail-only copy. */
  hideExplainer = false,
}: {
  subNavItems?: { id: string; label: string }[];
  subNavId?: string;
  onSubNavChange?: (id: string) => void;
  explainerTitle: string;
  explainerBody: string;
  children: ReactNode;
  /** When set (e.g. 0.85), only workflow content is zoomed; sub-nav and explainer stay full size. */
  mainContentZoom?: number;
  hidePreambleOnMd?: boolean;
  hideExplainer?: boolean;
}) {
  const preambleOnMd = hidePreambleOnMd ? "md:hidden" : "";
  const showExplainer = !hideExplainer;

  return (
    <div className="w-full p-5 sm:p-6 lg:p-8">
      {subNavItems.length > 0 && subNavId != null && onSubNavChange ? (
        <div
          className={cn(
            "mb-6 flex flex-wrap items-center gap-2",
            preambleOnMd
          )}
        >
          {subNavItems.map((tab) => {
            const active = subNavId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSubNavChange(tab.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-left text-[13px] font-workflow-chrome tracking-tight transition-colors sm:text-[14px]",
                  active
                    ? "bg-white/95 font-semibold text-[#18174d] shadow-sm ring-1 ring-[#18174d]/10"
                    : "font-medium text-[#3d3b56] hover:bg-white/50"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      ) : null}
      {showExplainer ? (
        <div
          className={cn("mb-6 flex flex-col gap-2", preambleOnMd)}
        >
          <h2 className="text-[20px] font-bold leading-tight tracking-tight text-[#18174d] font-workflow-chrome sm:text-[22px]">
            {explainerTitle}
          </h2>
          <p className="max-w-4xl text-[15px] font-workflow-chrome leading-relaxed text-[#494959]">
            {explainerBody}
          </p>
        </div>
      ) : null}
      <div
        className={cn("min-w-0", mainContentZoom != null && "origin-top")}
        style={
          mainContentZoom != null
            ? { zoom: mainContentZoom }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}

/** Dotted vertical join between two steps — round caps, 3px stroke; dash pattern tuned for density. */
function StepConnector() {
  return (
    <div className="flex justify-center" aria-hidden>
      <svg
        width={5}
        height={40}
        viewBox="0 0 5 40"
        className="shrink-0 text-[#a5a3ff]"
        aria-hidden
      >
        <line
          x1="2.5"
          y1="0"
          x2="2.5"
          y2="40"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="4 6"
        />
      </svg>
    </div>
  );
}

/** Read-only step card — matches SortableStepRow shell without drag/actions. */
function ReadOnlyStepRow({
  step,
  index,
}: {
  step: WorkflowStep;
  index: number;
}) {
  const stepNo = String(index + 1).padStart(2, "0");
  const agentLabel =
    AGENTS.find((a) => a.id === step.agentId)?.label ?? step.agentId;

  return (
    <div className="relative">
      <div
        className={cn(
          "relative w-full min-w-0 rounded-[11px] border border-[#4f4bff] px-4 py-3 shadow-[0px_4px_12px_0px_rgba(24,23,77,0.2)] sm:px-5",
          "bg-[#fcfcfe]"
        )}
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="flex h-[21px] w-[28px] shrink-0 items-center justify-center rounded-[2px] border border-[#4f4bff] bg-[#4f4bff] text-[12px] font-semibold leading-none text-white">
              {stepNo}
            </span>
            <h3 className="min-w-0 flex-1 text-balance break-words text-[16px] font-semibold leading-[1.2] text-[#18174d]">
              {step.title}
            </h3>
          </div>
        </div>
        <p className="mb-3 w-full min-w-0 text-pretty break-words text-[16px] leading-[1.2] text-[#494959]">
          {step.description}
        </p>
        <p className="mb-3 text-[14px] leading-[1.2] text-[#808094]">
          {step.durationLabel}
        </p>
        <div
          className={cn(
            "flex h-[calc(1.75rem*1.3)] min-h-[calc(1.75rem*1.3)] w-full min-w-0 items-center gap-2 rounded-full border border-[#4f4bff] bg-[#f4f4fa] pl-3 pr-3 text-[16px] font-normal text-[#18174d]"
          )}
        >
          <AgentIcon agentId={step.agentId} />
          <span className="min-w-0 break-words">{agentLabel}</span>
        </div>
      </div>
    </div>
  );
}

const workflowV2CardClass = cn(
  workflowV2PanelWidthClass,
  "rounded-2xl border border-[#e6e6ea] bg-[#F7F7F8] px-8 py-6"
);

/** Intro line under the version pills — shared typography (v1 / v2 / v3); kept in the same width wrapper as the workflow block below. */
const workflowVersionIntroDescriptionClass =
  "font-workflow-chrome text-[18px] font-semibold leading-snug tracking-tight text-[#18174d] sm:text-[20px]";

/** Version 2 — two workflows with room to breathe; wide layout (pivot stays narrow in parent). */
function WorkflowVersionTwoComparison() {
  const timeSteps = INITIAL_STEPS_TIME_OPTIMIZED;
  const agentSteps = INITIAL_STEPS_AGENT_OPTIMIZED;

  return (
    <div className="mx-auto w-full min-w-0 max-w-[min(75rem,100%)]">
      <div className="mb-5 w-full px-2 text-center">
        <h2
          id="wf-v2-intro-heading"
          className={workflowVersionIntroDescriptionClass}
        >
          {WORKFLOW_DIRECTION_INTRO_LINE.v2}
        </h2>
      </div>
      <div
        className="grid w-full min-w-0 grid-cols-1 items-start justify-items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-4 xl:gap-5"
      >
        <section
          className={workflowV2CardClass}
          aria-labelledby="wf-v2-time-heading"
        >
          <h3
            id="wf-v2-time-heading"
            className="mb-4 text-[16px] font-semibold leading-snug text-[#18174d] sm:text-[18px]"
          >
            Time optimized workflow
          </h3>
          <div
            className={cn(
              "flex flex-col",
              directionsExploredWorkflowColumnClass
            )}
          >
            <WorkflowDetailsPanel
              steps={timeSteps}
              variant="embedded"
              extraGapBeforeAgents
            />
            <div className="w-full min-w-0">
              <div className="flex flex-col pt-5">
                {timeSteps.map((step, index) => (
                  <Fragment key={step.id}>
                    <ReadOnlyStepRow step={step} index={index} />
                    {index < timeSteps.length - 1 && <StepConnector />}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className={workflowV2CardClass}
          aria-labelledby="wf-v2-agent-heading"
        >
          <h3
            id="wf-v2-agent-heading"
            className="mb-4 text-[16px] font-semibold leading-snug text-[#18174d] sm:text-[18px]"
          >
            Agent optimized workflow
          </h3>
          <div
            className={cn(
              "flex flex-col",
              directionsExploredWorkflowColumnClass
            )}
          >
            <WorkflowDetailsPanel steps={agentSteps} variant="embedded" />
            <div className="w-full min-w-0">
              <div className="flex flex-col pt-5">
                {agentSteps.map((step, index) => (
                  <Fragment key={step.id}>
                    <ReadOnlyStepRow step={step} index={index} />
                    {index < agentSteps.length - 1 && <StepConnector />}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SortableStepRow({
  step,
  index,
  totalSteps,
  editingStepId,
  onEnterEdit,
  onAgentChange,
  onAddAfter,
  onDelete,
  onCopy,
  onUpdateField,
}: {
  step: WorkflowStep;
  index: number;
  totalSteps: number;
  editingStepId: string | null;
  onEnterEdit: (id: string) => void;
  onAgentChange: (id: string, agentId: string) => void;
  onAddAfter: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  onUpdateField: (
    id: string,
    field: "title" | "description" | "durationLabel",
    value: string
  ) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: DndTransform.Transform.toString(transform),
    transition,
  };

  const stepNo = String(index + 1).padStart(2, "0");
  const canDelete = totalSteps > 1 || step.isNew;
  const isEditing = Boolean(step.isNew || editingStepId === step.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-workflow-step-root={step.id}
      className={cn(
        "group/step relative focus-within:outline-none",
        isDragging && "z-20"
      )}
    >
      {/* Card — #fcfcfe, 11px radius; + floats on bottom edge (half below card), no layout gap */}
      <div
        className={cn(
          "relative w-full min-w-0 rounded-[11px] border border-[#4f4bff] px-4 py-3 shadow-[0px_4px_12px_0px_rgba(24,23,77,0.2)] transition-colors",
          "bg-[#fcfcfe] hover:bg-[#f9f9fd] sm:px-5"
        )}
        onDoubleClick={(e) => {
          if (isEditing) return;
          e.preventDefault();
          onEnterEdit(step.id);
        }}
      >
        <button
          type="button"
          className={cn(
            "absolute bottom-0 left-1/2 z-10 flex size-10 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full",
            "border border-[#a5a3ff] bg-[#4f4bff] text-white shadow-[0px_2.9px_8.7px_rgba(0,0,0,0.08)]",
            "opacity-0 transition-opacity duration-150 pointer-events-none",
            "group-hover/step:pointer-events-auto group-hover/step:opacity-100",
            "group-focus-within/step:pointer-events-auto group-focus-within/step:opacity-100",
            "hover:bg-[#4540e6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]"
          )}
          aria-label="Add step after this one"
          onClick={(e) => {
            e.stopPropagation();
            onAddAfter(step.id);
          }}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <Plus className="size-[21px]" strokeWidth={2.5} />
        </button>

        <div className="mb-3 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              className="flex size-[29px] shrink-0 touch-none cursor-grab items-center justify-center rounded-md text-[#494959] active:cursor-grabbing"
              aria-label={`Drag to reorder step ${index + 1}`}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-[18px]" strokeWidth={2} />
            </button>
            <span className="flex h-[21px] w-[28px] shrink-0 items-center justify-center rounded-[2px] border border-[#4f4bff] bg-[#4f4bff] text-[12px] font-semibold leading-none text-white">
              {stepNo}
            </span>
            {isEditing ? (
              <input
                type="text"
                value={step.title}
                onChange={(e) =>
                  onUpdateField(step.id, "title", e.target.value)
                }
                placeholder="Step title"
                className="min-w-0 flex-1 rounded-md border border-[#dadae1] bg-white px-2 py-1 text-[16px] font-semibold leading-[1.2] text-[#18174d] outline-none focus:border-[#4f4bff]"
              />
            ) : (
              <h3 className="min-w-0 flex-1 text-balance break-words text-[16px] font-semibold leading-[1.2] text-[#18174d]">
                {step.title}
              </h3>
            )}
          </div>
        </div>

        {/* Figma 22:34902 — vertical toolbar on outer right edge; hover / focus-within */}
        <div
          className={cn(
            "absolute left-full top-0 z-10 pl-2",
            "opacity-0 transition-opacity duration-150 pointer-events-none",
            "group-hover/step:pointer-events-auto group-hover/step:opacity-100",
            "group-focus-within/step:pointer-events-auto group-focus-within/step:opacity-100"
          )}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <div
            className={cn(
              "flex w-9 flex-col overflow-hidden rounded-lg border border-[#4f4bff] bg-[#f4f4fa]",
              "shadow-[0px_4px_12px_0px_rgba(24,23,77,0.2)]"
            )}
            role="toolbar"
            aria-label="Step actions"
          >
            <button
              type="button"
              disabled={!canDelete}
              className={cn(
                "flex size-9 shrink-0 items-center justify-center text-[#494959] transition-colors",
                "border-b border-[#a5a3ff] hover:bg-white focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4f4bff]/35",
                "disabled:pointer-events-none disabled:opacity-40"
              )}
              aria-label="Delete step"
              onClick={() => canDelete && onDelete(step.id)}
            >
              <Trash2 className="size-[18px]" strokeWidth={2} />
            </button>
            <button
              type="button"
              className={cn(
                "flex size-9 shrink-0 items-center justify-center text-[#494959] transition-colors",
                "hover:bg-white focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4f4bff]/35"
              )}
              aria-label="Duplicate step"
              onClick={() => onCopy(step.id)}
            >
              <Copy className="size-[18px]" strokeWidth={2} />
            </button>
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={step.description}
            onChange={(e) =>
              onUpdateField(step.id, "description", e.target.value)
            }
            placeholder="Describe this step…"
            rows={3}
            className="mb-3 w-full resize-y rounded-md border border-[#dadae1] bg-white px-3 py-2 text-[16px] leading-[1.2] text-[#494959] outline-none focus:border-[#4f4bff]"
          />
        ) : (
          <p className="mb-3 w-full min-w-0 text-pretty break-words text-[16px] leading-[1.2] text-[#494959]">
            {step.description}
          </p>
        )}

        {isEditing ? (
          <input
            type="text"
            value={step.durationLabel}
            onChange={(e) =>
              onUpdateField(step.id, "durationLabel", e.target.value)
            }
            placeholder="e.g. 60 mins"
            className="mb-3 w-full max-w-[12rem] rounded border border-[#dadae1] bg-white px-2 py-1.5 text-[14px] text-[#808094] outline-none focus:border-[#4f4bff]"
          />
        ) : (
          <p className="mb-3 text-[14px] leading-[1.2] text-[#808094]">
            {step.durationLabel}
          </p>
        )}

        <Select
          value={step.agentId}
          onValueChange={(v) => onAgentChange(step.id, v ?? "manual")}
        >
          <SelectTrigger
            size="sm"
            onDoubleClick={(e) => e.stopPropagation()}
            className={cn(
              "h-[calc(1.75rem*1.3)] min-h-[calc(1.75rem*1.3)] data-[size=sm]:h-[calc(1.75rem*1.3)] w-full min-w-0 max-w-full justify-between gap-2 rounded-full data-[size=sm]:rounded-full border-[#4f4bff] bg-[#f4f4fa] pl-3 pr-3 text-[16px] font-normal text-[#18174d] transition-colors group-hover/step:bg-[#ededfe]",
              "shadow-none focus-visible:border-[#4f4bff] focus-visible:ring-2 focus-visible:ring-[#4f4bff]/25",
              "*:data-[slot=select-value]:flex *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 *:data-[slot=select-value]:text-[#18174d]"
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <AgentIcon agentId={step.agentId} />
              <SelectValue placeholder="Select agent" />
            </span>
          </SelectTrigger>
          <SelectContent
            side="bottom"
            align="start"
            alignItemWithTrigger={false}
            collisionAvoidance={{ side: "none" }}
            className="min-w-[var(--radix-select-trigger-width)]"
          >
            {AGENTS.map((a) => (
              <SelectItem
                key={a.id}
                value={a.id}
                className="min-h-[calc(2rem*1.3)] py-[calc(0.25rem*1.3)]"
              >
                <span className="flex items-center gap-2">
                  <AgentIcon agentId={a.id} />
                  {a.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function WorkflowPage() {
  const [pivotSection, setPivotSection] = useState<PivotSectionId>(
    "directions-explored"
  );
  const [directionIteration, setDirectionIteration] = useState("v1");
  /** Left Figma rail: which row shows body + tag pills. */
  const [directionsPivotOpenId, setDirectionsPivotOpenId] = useState<string | null>(
    "v1"
  );
  useEffect(() => {
    setDirectionsPivotOpenId(directionIteration);
  }, [directionIteration]);
  const [uiExplorationId, setUiExplorationId] = useState("ui-1");
  const [uiPivotOpenId, setUiPivotOpenId] = useState<string | null>("ui-1");
  useEffect(() => {
    setUiPivotOpenId(uiExplorationId);
  }, [uiExplorationId]);
  const [steps, setSteps] = useState<WorkflowStep[]>(() => defaultSteps());
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  const [workflowSnapshotId, setWorkflowSnapshotId] = useState(
    WORKFLOW_SNAPSHOT_OPTIONS[0]?.id ?? "version-1"
  );
  const [agentScope, setAgentScope] = useState<AgentScopeMode>("company");
  const optimizeTimeRangeOptions = useMemo(
    () => getOptimizeTimeRangeOptionsForSteps(steps),
    [steps]
  );
  const [optimizeTimeRangeId, setOptimizeTimeRangeId] = useState(
    () => getOptimizeTimeRangeOptionsForSteps(defaultSteps())[0]?.id ?? "path"
  );
  const [optimizeStakeholderIds, setOptimizeStakeholderIds] = useState<
    string[]
  >(() => OPTIMIZE_STAKEHOLDER_OPTIONS.map((o) => o.id));
  const [workflowMarkedActive, setWorkflowMarkedActive] = useState(false);
  const [v3Reoptimizing, setV3Reoptimizing] = useState(false);
  const [v3SaveStatus, setV3SaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const v3OptimizeGenRef = useRef(0);
  const v3OptimizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    if (optimizeTimeRangeOptions.some((o) => o.id === optimizeTimeRangeId))
      return;
    setOptimizeTimeRangeId(
      optimizeTimeRangeOptions[0]?.id ?? "path"
    );
  }, [optimizeTimeRangeOptions, optimizeTimeRangeId]);

  useEffect(() => {
    return () => {
      if (v3OptimizeTimeoutRef.current)
        clearTimeout(v3OptimizeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (v3SaveStatus !== "saved") return;
    const t = setTimeout(() => setV3SaveStatus("idle"), 4000);
    return () => clearTimeout(t);
  }, [v3SaveStatus]);

  function toggleOptimizeStakeholder(id: string, nextChecked: boolean) {
    setOptimizeStakeholderIds((prev) => {
      if (nextChecked) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      if (prev.length <= 1) return prev;
      return prev.filter((x) => x !== id);
    });
  }

  function handleV3Optimize() {
    if (v3Reoptimizing) return;
    if (v3OptimizeTimeoutRef.current) {
      clearTimeout(v3OptimizeTimeoutRef.current);
      v3OptimizeTimeoutRef.current = null;
    }
    setV3Reoptimizing(true);
    v3OptimizeGenRef.current += 1;
    const gen = v3OptimizeGenRef.current;
    v3OptimizeTimeoutRef.current = setTimeout(() => {
      setSteps((prev) => applyOptimizationJitter(prev, gen));
      setV3Reoptimizing(false);
      v3OptimizeTimeoutRef.current = null;
    }, 1700);
  }

  function handleV3SaveNew() {
    if (v3SaveStatus === "saving") return;
    setV3SaveStatus("saving");
    setTimeout(() => setV3SaveStatus("saved"), 1200);
  }

  const editBaselineRef = useRef<Map<string, StepDraftSnapshot>>(new Map());
  const stepsRef = useRef(steps);
  const editingStepIdRef = useRef(editingStepId);
  stepsRef.current = steps;
  editingStepIdRef.current = editingStepId;

  const ids = useMemo(() => steps.map((s) => s.id), [steps]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    function onPointerDownCapture(e: PointerEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-slot="select-content"]')) return;
      if (target.closest('[data-slot="dropdown-menu-content"]')) return;

      const currentSteps = stepsRef.current;
      const activeEditId = editingStepIdRef.current;

      const draftIds: string[] = [];
      for (const s of currentSteps) {
        if (s.isNew || s.id === activeEditId) draftIds.push(s.id);
      }
      if (draftIds.length === 0) return;

      for (const id of draftIds) {
        const rootEl = document.querySelector<HTMLElement>(
          `[data-workflow-step-root="${globalThis.CSS.escape(id)}"]`
        );
        if (!rootEl) continue;
        if (rootEl.contains(target)) continue;

        const step = currentSteps.find((s) => s.id === id);
        const baseline = editBaselineRef.current.get(id);
        if (!step || !baseline) continue;

        const unchanged = isSameDraft(snapshotStep(step), baseline);

        if (step.isNew && unchanged) {
          setSteps((prev) => prev.filter((s) => s.id !== id));
          editBaselineRef.current.delete(id);
          setEditingStepId((eid) => (eid === id ? null : eid));
          if (editingStepIdRef.current === id) editingStepIdRef.current = null;
        } else if (step.isNew && !unchanged) {
          setSteps((prev) =>
            prev.map((s) => (s.id === id ? { ...s, isNew: false } : s))
          );
          editBaselineRef.current.delete(id);
          setEditingStepId((eid) => (eid === id ? null : eid));
          if (editingStepIdRef.current === id) editingStepIdRef.current = null;
        } else if (!step.isNew && activeEditId === id) {
          setEditingStepId(null);
          editBaselineRef.current.delete(id);
          editingStepIdRef.current = null;
        }
      }
    }

    document.addEventListener("pointerdown", onPointerDownCapture, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDownCapture, true);
  }, []);

  function enterEdit(id: string) {
    const s = steps.find((x) => x.id === id);
    if (!s || s.isNew) return;
    editBaselineRef.current.set(id, snapshotStep(s));
    setEditingStepId(id);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    setSteps((items) => arrayMove(items, oldIndex, newIndex));
  }

  function addStepAfter(parentId: string) {
    const newStep = createEmptyStep();
    editBaselineRef.current.set(newStep.id, snapshotStep(newStep));
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === parentId);
      if (idx < 0) return prev;
      const next = [...prev];
      next.splice(idx + 1, 0, newStep);
      return next;
    });
  }

  function deleteStep(id: string) {
    setSteps((prev) => {
      const step = prev.find((s) => s.id === id);
      if (!step) return prev;
      if (step.isNew) return prev.filter((s) => s.id !== id);
      if (prev.length <= 1) return prev;
      return prev.filter((s) => s.id !== id);
    });
    setEditingStepId((eid) => (eid === id ? null : eid));
    if (editingStepIdRef.current === id) editingStepIdRef.current = null;
    editBaselineRef.current.delete(id);
  }

  function copyStep(id: string) {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const s = prev[idx];
      const dup: WorkflowStep = {
        ...s,
        id: newStepId(),
        isNew: false,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, dup);
      return next;
    });
  }

  function updateField(
    id: string,
    field: "title" | "description" | "durationLabel",
    value: string
  ) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  const workflowStepsBlock =
    steps.length === 0 ? (
      <p className="pt-5 text-[16px] text-[#808094]">
        No workflow steps yet.
      </p>
    ) : (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col pt-5">
            {steps.map((step, index) => (
              <Fragment key={step.id}>
                <SortableStepRow
                  step={step}
                  index={index}
                  totalSteps={steps.length}
                  editingStepId={editingStepId}
                  onEnterEdit={enterEdit}
                  onAgentChange={(id, agentId) =>
                    setSteps((prev) =>
                      prev.map((s) =>
                        s.id === id ? { ...s, agentId } : s
                      )
                    )
                  }
                  onAddAfter={addStepAfter}
                  onDelete={deleteStep}
                  onCopy={copyStep}
                  onUpdateField={updateField}
                />
                {index < steps.length - 1 && <StepConnector />}
              </Fragment>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );

  const directionSubNavItems = useMemo(
    () =>
      WORKFLOW_DIRECTION_ITERATIONS.map((t) => ({
        id: t.id,
        label: t.title,
      })),
    []
  );

  const exploreCopy = useMemo(() => {
    return (
      DIRECTION_EXPLAINERS[directionIteration] ?? DIRECTION_EXPLAINERS.v1
    );
  }, [directionIteration]);

  const uiExploreCopy = useMemo(() => {
    return (
      UI_EXPLORATION_EXPLAINERS[uiExplorationId] ?? UI_EXPLORATION_EXPLAINERS["ui-1"]
    );
  }, [uiExplorationId]);

  return (
    <div
      className={cn(
        "workflow-editor-root min-h-svh px-4 py-8 text-left font-sans antialiased sm:py-10",
        pivotSection === "final-design"
          ? "workflow-v4-canvas-bg"
          : "workflow-grid-bg"
      )}
    >
      <div className="mx-auto w-full max-w-4xl">
        <WorkflowPortfolioPivotNav
          activeId={pivotSection}
          onSelect={setPivotSection}
        />
      </div>

      {pivotSection === "context" ? (
        <div className="min-h-[50vh]" aria-hidden />
      ) : null}

      {pivotSection === "ui-explorations" ? (
        <div className="mt-6 w-full px-3 md:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-[min(96rem,calc(100vw-1.5rem))] flex-col items-stretch gap-5 md:flex-row md:items-stretch md:gap-5 lg:gap-6">
            <div
              className={cn(
                "hidden min-w-0 shrink-0 md:block",
                "md:flex md:w-80 md:max-w-[min(20rem,calc(100vw-1rem))] md:flex-col md:pl-0",
                "md:pr-3"
              )}
            >
              <div
                className={cn(
                  "md:sticky md:top-28 md:z-20",
                  "md:max-h-[calc(100dvh-7rem)] md:overflow-y-auto md:overflow-x-hidden"
                )}
              >
                <UiExplorationsPivotRail
                  activeId={uiExplorationId}
                  onActiveChange={setUiExplorationId}
                  openId={uiPivotOpenId}
                  onOpenChange={setUiPivotOpenId}
                  explainers={UI_EXPLORATION_EXPLAINERS}
                />
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center md:min-w-0 md:pl-2 md:pr-1">
              <div className="mx-auto w-full min-w-0 max-w-[min(80rem,100%)]">
                <WorkflowExploreShell
                  explainerTitle={uiExploreCopy.title}
                  explainerBody={uiExploreCopy.body}
                  mainContentZoom={0.85}
                  hidePreambleOnMd={uiExplorationId !== "ui-1"}
                  hideExplainer={uiExplorationId === "ui-1"}
                >
                  <div
                    className={cn(
                      "mx-auto w-full min-w-0 px-1",
                      uiExplorationId === "ui-1"
                        ? "max-w-[min(96rem,100%)]"
                        : "max-w-3xl"
                    )}
                  >
                    {uiExplorationId === "ui-1" ? (
                      <UiStepVariationsGrid />
                    ) : null}
                  </div>
                </WorkflowExploreShell>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {pivotSection === "directions-explored" ? (
        <div className="mt-6 w-full px-3 md:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-[min(96rem,calc(100vw-1.5rem))] flex-col items-stretch gap-5 md:flex-row md:items-stretch md:gap-5 lg:gap-6">
            <div
              className={cn(
                "hidden min-w-0 shrink-0 md:block",
                "md:flex md:w-80 md:max-w-[min(20rem,calc(100vw-1rem))] md:flex-col md:pl-0",
                "md:pr-3"
              )}
            >
              <div
                className={cn(
                  "md:sticky md:top-28 md:z-20",
                  "md:max-h-[calc(100dvh-7rem)] md:overflow-y-auto md:overflow-x-hidden"
                )}
              >
                <DirectionsExploredPivotRail
                  activeId={directionIteration}
                  onActiveChange={setDirectionIteration}
                  openId={directionsPivotOpenId}
                  onOpenChange={setDirectionsPivotOpenId}
                  explainers={DIRECTION_EXPLAINERS}
                />
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center md:min-w-0 md:pl-2 md:pr-1">
              <div className="mx-auto w-full min-w-0 max-w-[min(80rem,100%)]">
                <WorkflowExploreShell
                  subNavItems={directionSubNavItems}
                  subNavId={directionIteration}
                  onSubNavChange={setDirectionIteration}
                  explainerTitle={exploreCopy.title}
                  explainerBody={exploreCopy.body}
                  mainContentZoom={0.85}
                  hidePreambleOnMd
                >
            {directionIteration === "v1" ? (
              <div
                className={cn(
                  "flex w-full flex-col items-stretch -translate-x-[150px]",
                  directionsExploredWorkflowColumnClass
                )}
              >
                <div className="mb-5 w-full px-2 text-center">
                  <h2
                    id="wf-v1-intro-heading"
                    className={workflowVersionIntroDescriptionClass}
                  >
                    {WORKFLOW_DIRECTION_INTRO_LINE.v1}
                  </h2>
                </div>
                <div
                  className={cn(
                    workflowV3FaintPanelClass,
                    "box-border w-full",
                    "pt-8 pb-6"
                  )}
                >
                  <WorkflowDetailsPanel
                    steps={steps}
                    timeTakenHoursOnly
                    variant="embedded"
                    tightEmbeddedStatsGap
                  />
                  <div className="w-full min-w-0 pt-2">
                    {workflowStepsBlock}
                  </div>
                </div>
              </div>
            ) : null}
            {directionIteration === "v2" ? (
              <div className="w-full min-w-0 -translate-x-[72px] overflow-x-auto">
                <WorkflowVersionTwoComparison />
              </div>
            ) : null}
            {directionIteration === "v3" ? (
              <div className="w-full min-w-0 overflow-x-auto md:-translate-x-[150px] lg:-translate-x-[190px]">
                <div className="mx-auto mb-5 w-full max-w-[840px] px-2 text-center">
                  <h2
                    id="wf-v3-intro-heading"
                    className={workflowVersionIntroDescriptionClass}
                  >
                    {WORKFLOW_DIRECTION_INTRO_LINE.v3}
                  </h2>
                </div>
                <div className="w-full min-w-0 overflow-x-auto">
                  <div
                    className={cn(
                      "mx-auto flex w-full min-h-0 min-w-[min(100%,280px)] max-w-full flex-col items-stretch gap-8",
                      "lg:min-w-[min(100%,504px)] lg:max-w-[840px] lg:flex-row lg:items-start lg:gap-8"
                    )}
                  >
                  <WorkflowV3OptimizePanel
                    timeRangeId={optimizeTimeRangeId}
                    timeRangeOptions={optimizeTimeRangeOptions}
                    onTimeRangeChange={setOptimizeTimeRangeId}
                    stakeholderIds={optimizeStakeholderIds}
                    onStakeholderToggle={toggleOptimizeStakeholder}
                    agentScope={agentScope}
                    onAgentScopeChange={setAgentScope}
                    onOptimize={handleV3Optimize}
                    onSaveNew={handleV3SaveNew}
                    optimizeDisabled={v3Reoptimizing}
                    saveDisabled={v3SaveStatus === "saving"}
                  />

                  <section
                    className={cn(
                      workflowV3FaintPanelClass,
                      "box-border h-min min-w-0 w-full shrink-0 self-start lg:max-w-[616px]"
                    )}
                  >
                    {v3Reoptimizing ? (
                      <div
                        className={cn(
                          directionsExploredWorkflowColumnClass,
                          "flex min-h-[280px] w-full flex-col items-center justify-center gap-4 py-12 text-center"
                        )}
                        role="status"
                        aria-live="polite"
                        aria-busy="true"
                      >
                        <Loader2
                          className="size-10 shrink-0 animate-spin text-[#4f4bff]"
                          aria-hidden
                        />
                        <p className="text-[17px] font-semibold text-[#18174d]">
                          Reoptimizing flow
                        </p>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "flex flex-col text-left",
                          directionsExploredWorkflowColumnClass
                        )}
                      >
                        <div className="mb-6 flex w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-3">
                          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 pr-2">
                            <Select
                              value={workflowSnapshotId}
                              onValueChange={(v) => v && setWorkflowSnapshotId(v)}
                            >
                              <SelectTrigger
                                id="workflow-snapshot-version"
                                className={cn(
                                  "h-auto min-h-0 w-fit max-w-full border-0 bg-transparent p-0 shadow-none",
                                  "gap-1.5 text-left",
                                  workflowV3VersionTriggerClass,
                                  "focus-visible:ring-2 focus-visible:ring-[#4f4bff]/30 focus-visible:ring-offset-0",
                                  "data-[size=default]:h-auto [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-[#18174d]/50",
                                  "[&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:shrink-0 [&_[data-slot=select-value]]:overflow-visible [&_[data-slot=select-value]]:whitespace-nowrap [&_[data-slot=select-value]]:text-left"
                                )}
                              >
                                <SelectValue placeholder="Version">
                                  {(value) => {
                                    const o = WORKFLOW_SNAPSHOT_OPTIONS.find(
                                      (x) => x.id === value
                                    );
                                    return (
                                      o?.label ??
                                      (value != null ? String(value) : "")
                                    );
                                  }}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent
                                align="start"
                                alignItemWithTrigger={false}
                              >
                                {WORKFLOW_SNAPSHOT_OPTIONS.map((o) => (
                                  <SelectItem key={o.id} value={o.id}>
                                    {o.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {v3SaveStatus === "saving" ? (
                              <span className="flex items-center gap-2 text-[14px] text-[#494959]">
                                <Loader2
                                  className="size-4 shrink-0 animate-spin text-[#4f4bff]"
                                  aria-hidden
                                />
                                Saving version…
                              </span>
                            ) : null}
                            {v3SaveStatus === "saved" ? (
                              <span className="flex items-center gap-2 text-[14px] font-medium text-emerald-700">
                                <span
                                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
                                  aria-hidden
                                >
                                  <Check className="size-3 stroke-[3]" />
                                </span>
                                Version saved
                              </span>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 justify-end">
                            <MarkAsActiveToggle
                              checked={workflowMarkedActive}
                              onCheckedChange={setWorkflowMarkedActive}
                            />
                          </div>
                        </div>

                        <WorkflowDetailsPanel
                          steps={steps}
                          variant="embedded"
                          statsDensity="compact"
                        />
                        <div className="w-full min-w-0">
                          {workflowStepsBlock}
                        </div>
                      </div>
                    )}
                  </section>
                  </div>
                </div>
              </div>
            ) : null}
          </WorkflowExploreShell>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {pivotSection === "final-design" ? (
        <div className="mt-6 w-full pb-8">
          <WorkflowVersionFourLaptopFrame />
        </div>
      ) : null}
    </div>
  );
}
