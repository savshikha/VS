import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, ChevronUp, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { WF_FIGMA } from "./mcpFigmaIconUrls";
import {
  AgentSuggestionPopoverLayer,
  ChosenAgentTrigger,
  type AgentKey,
  type AgentSuggestionDropdownVariant,
} from "./AgentSuggestionDropdown";
import { WorkflowCanvasDetailsPanel } from "./WorkflowCanvasDetailsPanel";
import { StepOverflowFlyout } from "./WorkflowStepOverflowFlyout";

/** Which step currently has the agent suggestion popover open (hides that step’s “+”). */
const AgentDropdownOpenContext = createContext<{
  setAgentDropdownOpen: (stepId: string, open: boolean) => void;
} | null>(null);

function useAgentDropdownOpenContext() {
  return useContext(AgentDropdownOpenContext);
}

/** Figma 1:8485 — step without agent suggestions. */
export type NoSuggestionVisualState =
  | "default"
  | "hover"
  | "drag"
  | "placeholder";

/** Figma 1:8627 — step with agent suggestions. */
export type SuggestionVisualState =
  | "default"
  | "dropdownOpen"
  | "agentChosen"
  | "hover"
  | "drag";

/** Which single field is in edit mode for a step (title or description, never both). */
export type StepEditField = "title" | "description";

export type WorkflowCanvasStep = {
  id: string;
  stepLabel: string;
  title: string;
  description: string;
  /** Just inserted via “+”; shows Figma 149:53800 new-step card until committed. */
  isNew?: boolean;
  showAgentSuggestion?: boolean;
  /** When `showAgentSuggestion` is false — Figma 1:8485. */
  noSuggestionState?: NoSuggestionVisualState;
  /** When `showAgentSuggestion` is true — Figma 1:8627. */
  suggestionState?: SuggestionVisualState;
  /** Used when `suggestionState === "agentChosen"`. */
  selectedAgentLabel?: string;
  /** Figma 1:8791 — body shown when the agent row popover is open. */
  agentDropdownVariant?: AgentSuggestionDropdownVariant;
  /** Figma 1:9461 — contributes to “Time taken” in the details row. */
  durationMinutes?: number;
};

const DEFAULT_STEPS: WorkflowCanvasStep[] = [
  {
    id: "1",
    stepLabel: "O1",
    title: "Assess Current Performance",
    description:
      "Assessment report and recommendations for improvements",
    showAgentSuggestion: false,
    noSuggestionState: "default",
    durationMinutes: 90,
  },
  {
    id: "2",
    stepLabel: "O2",
    title: "Define Evaluation Objectives",
    description:
      "Documented performance management objectives with organizational goals",
    showAgentSuggestion: true,
    suggestionState: "default",
    durationMinutes: 120,
  },
  {
    id: "3",
    stepLabel: "O3",
    title: "Design Performance Management",
    description:
      "Performance management framework document, timeline for performance evaluations",
    showAgentSuggestion: true,
    suggestionState: "default",
    durationMinutes: 60,
  },
  {
    id: "4",
    stepLabel: "O4",
    title: "Develop Training Programs for Managers",
    description:
      "Training program curriculum, trained managers ready to implement the system",
    showAgentSuggestion: true,
    suggestionState: "default",
    durationMinutes: 180,
  },
  {
    id: "5",
    stepLabel: "O5",
    title: "Monitor and Evaluate Effectiveness",
    description:
      "Evaluation report on system effectiveness, recommendations for ongoing improvements",
    showAgentSuggestion: false,
    noSuggestionState: "default",
    durationMinutes: 45,
  },
  {
    id: "6",
    stepLabel: "O6",
    title: "Adjust and Refine Performance System",
    description:
      "Revised performance management system, updated training materials if necessary",
    showAgentSuggestion: false,
    noSuggestionState: "default",
    durationMinutes: 60,
  },
];

function nextStepLabelFromSteps(steps: WorkflowCanvasStep[]): string {
  let max = 0;
  for (const s of steps) {
    const m = /^O(\d+)$/i.exec(s.stepLabel.trim());
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `O${max + 1}`;
}

/** Figma Key screens 149:53800 — card shown immediately after “+” adds a step. */
function createNewCanvasStep(steps: WorkflowCanvasStep[]): WorkflowCanvasStep {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  return {
    id: `step-${id}`,
    stepLabel: nextStepLabelFromSteps(steps),
    title: "",
    description: "",
    showAgentSuggestion: true,
    suggestionState: "default",
    isNew: true,
    durationMinutes: 45,
  };
}

const shadowCard = "shadow-[0px_-3.4px_10.2px_rgba(0,0,0,0.08)]";
const shadowElevated =
  "shadow-[4px_4px_16px_0px_rgba(157,78,221,0.16)]";
const borderActive = "border-[1.5px] border-[#4f4bff]";

/**
 * Figma `Arrow` + `Arrow/State2` — vertical connector between steps.
 */
function WorkflowStepConnector({ visible = true }: { visible?: boolean }) {
  if (!visible) {
    return <div className="h-[53px] w-5 shrink-0" aria-hidden />;
  }
  return (
    <div
      className="relative h-[53px] w-5 shrink-0 overflow-clip"
      data-name="Arrow"
      aria-hidden
    >
      <div className="absolute top-px left-[10px] h-[50.973px] w-0">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-px w-[50.973px] flex-none rotate-90">
            <div className="relative size-full">
              <div className="absolute inset-[-6.26px_-1.67%]">
                <img
                  alt=""
                  src={WF_FIGMA.canvasArrowConnector}
                  className="block size-full max-w-none"
                  width={51}
                  height={51}
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Same pattern as `WorkflowPage` `SortableStepRow`: + sits on the bottom edge of the
 * card; shifted slightly down (`translate-y-[68%]`) so more of the pill sits below the edge
 * while still overlapping the step.
 */
function FloatingAddStepAfterButton({
  forceVisible,
  onClick,
}: {
  /** When step data uses explicit `hover` state (static demo). */
  forceVisible?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onDoubleClick={(e) => e.stopPropagation()}
      className={cn(
        "absolute bottom-0 left-1/2 z-10 flex size-10 -translate-x-1/2 translate-y-[68%] items-center justify-center rounded-full",
        "border border-[#a5a3ff] bg-[#4f4bff] text-white shadow-[0px_2.9px_8.7px_rgba(0,0,0,0.08)]",
        "transition-opacity duration-150",
        forceVisible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0 group-hover/step:pointer-events-auto group-hover/step:opacity-100 group-focus-within/step:pointer-events-auto group-focus-within/step:opacity-100",
        "hover:bg-[#4540e6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]"
      )}
      aria-label="Add step after this one"
    >
      <Plus className="size-[21px]" strokeWidth={2.5} />
    </button>
  );
}

function StepBadge({
  label,
  dragStyle,
  agentCommitted,
}: {
  label: string;
  dragStyle?: boolean;
  /** Figma 1:8662 — gradient badge when an agent is assigned to the step. */
  agentCommitted?: boolean;
}) {
  if (agentCommitted) {
    return (
      <div className="flex h-[57px] w-[58px] shrink-0 items-center justify-center rounded-[28px] border-[0.85px] border-[#4f4bff] bg-gradient-to-b from-[rgba(79,75,255,0.16)] to-[rgba(151,71,255,0.16)] px-3.5 py-4">
        <span className="text-[20px] font-semibold leading-none text-[#4f4bff]">
          {label}
        </span>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex h-[57px] w-[58px] shrink-0 items-center justify-center rounded-[28px] px-3.5 py-4",
        dragStyle
          ? "border-[1.5px] border-transparent bg-gradient-to-br from-[#e8e4ff] to-[#d4d0ff] [background-clip:padding-box]"
          : "border border-[#4f4bff] bg-[#ededfe]"
      )}
    >
      <span className="text-[20px] font-semibold leading-none text-[#4f4bff]">
        {label}
      </span>
    </div>
  );
}

/**
 * Figma 1:8540 / 1:8589 — double-click header for title only, or description for body only (one field at a time).
 */
function StepEditableTextBlock({
  title,
  description,
  editingField,
  interactive,
  onEnterEdit,
  onUpdateTitle,
  onUpdateDescription,
}: {
  title: string;
  description: string;
  editingField: StepEditField | null;
  interactive: boolean;
  onEnterEdit: (field: StepEditField) => void;
  onUpdateTitle: (value: string) => void;
  onUpdateDescription: (value: string) => void;
}) {
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingField !== "title") return;
    titleRef.current?.focus();
    titleRef.current?.select();
  }, [editingField]);

  useEffect(() => {
    if (editingField !== "description") return;
    descRef.current?.focus();
    descRef.current?.select();
  }, [editingField]);

  const editingTitle = editingField === "title";
  const editingDescription = editingField === "description";

  const fieldClass =
    "rounded-md border border-[#dadae1] bg-white outline-none placeholder:text-[#808094] focus:border-[#4f4bff]";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 leading-[1.2]">
      {editingTitle ? (
        <input
          ref={titleRef}
          type="text"
          data-step-editing-fields
          value={title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          aria-label="Step title"
          className={cn(
            "w-full px-2 py-1 text-[15px] font-semibold leading-[1.2] text-[#18174d]",
            fieldClass
          )}
        />
      ) : (
        <p
          className={cn(
            "text-[15px] font-semibold text-[#18174d]",
            interactive && "cursor-text"
          )}
          onDoubleClick={(e) => {
            if (!interactive) return;
            e.preventDefault();
            e.stopPropagation();
            onEnterEdit("title");
          }}
        >
          {title}
        </p>
      )}
      {editingDescription ? (
        <textarea
          ref={descRef}
          data-step-editing-fields
          value={description}
          onChange={(e) => onUpdateDescription(e.target.value)}
          aria-label="Step description"
          rows={3}
          className={cn(
            "min-h-[72px] w-full resize-y px-2 py-1.5 text-[13.5px] leading-[1.2] text-[#494959]",
            fieldClass
          )}
        />
      ) : (
        <p
          className={cn(
            "line-clamp-2 text-[13.5px] font-normal text-[#494959]",
            interactive && "cursor-text"
          )}
          onDoubleClick={(e) => {
            if (!interactive) return;
            e.preventDefault();
            e.stopPropagation();
            onEnterEdit("description");
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function DragHandle() {
  return (
    <div className="relative size-[29px] shrink-0">
      <img
        alt=""
        src={WF_FIGMA.canvasDrag}
        className="absolute block size-full max-w-none object-contain"
        width={29}
        height={29}
        decoding="async"
      />
    </div>
  );
}

type NoSuggestionProps = {
  stepId: string;
  stepLabel: string;
  title: string;
  description: string;
  state: NoSuggestionVisualState;
  isEditing?: boolean;
  editingField?: StepEditField | null;
  onEnterEdit?: (field: StepEditField) => void;
  onUpdateTitle?: (value: string) => void;
  onUpdateDescription?: (value: string) => void;
  onDeleteStep?: () => void;
};

/** Figma 1:8485 — no agent row. */
export function WorkflowStepNoSuggestion({
  stepId,
  stepLabel,
  title,
  description,
  state,
  isEditing = false,
  editingField = null,
  onEnterEdit = (_field: StepEditField) => {},
  onUpdateTitle = () => {},
  onUpdateDescription = () => {},
  onDeleteStep = () => {},
}: NoSuggestionProps) {
  if (state === "placeholder") {
    return (
      <div
        className={cn(
          "flex w-full max-w-[min(432px,100%)] items-start gap-2 rounded-xl border-[1.5px] border-dashed border-[#a5a3ff] bg-[#f8f7ff] p-4",
          "min-h-[98px]"
        )}
        data-state="placeholder"
      >
        <div className="shrink-0 self-start">
          <DragHandle />
        </div>
        <div className="flex min-w-0 flex-1 items-start gap-[18px] opacity-50">
          <div className="h-[57px] w-[58px] shrink-0 rounded-[28px] border border-dashed border-[#a5a3ff] bg-[#fcfcfe]" />
          <p className="text-[13.5px] text-[#494959]">Drop or add step</p>
        </div>
      </div>
    );
  }

  const isDrag = state === "drag";
  const isHover = state === "hover";
  const interactive = state === "default";

  return (
    <div
      data-step-card
      data-workflow-step-root={stepId}
      className={cn(
        "w-full max-w-[min(432px,100%)] rounded-xl p-4 bg-[#fcfcfe]",
        isDrag || isHover || isEditing
          ? cn(borderActive, shadowElevated)
          : interactive
            ? cn(
                "border-[1.5px] border-[#a5a3ff]",
                shadowCard,
                "transition-[border-color,box-shadow] duration-150",
                "group-hover/step:border-[#4f4bff] group-hover/step:shadow-[4px_4px_16px_0px_rgba(157,78,221,0.16)]"
              )
            : cn("border-[1.5px] border-[#a5a3ff]", shadowCard)
      )}
      data-state={state}
    >
      <div className="flex w-full items-start gap-2">
        <div
          className="shrink-0 self-start"
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <DragHandle />
        </div>
        <div
          className={cn(
            "flex min-w-0 flex-1 items-start gap-[18px]"
          )}
        >
          <StepBadge label={stepLabel} dragStyle={isDrag} />
          <StepEditableTextBlock
            title={title}
            description={description}
            editingField={editingField ?? null}
            interactive={interactive}
            onEnterEdit={onEnterEdit}
            onUpdateTitle={onUpdateTitle}
            onUpdateDescription={onUpdateDescription}
          />
          <div
            className={cn(
              "flex w-8 shrink-0 justify-end self-start",
              interactive &&
                "opacity-0 transition-opacity duration-150 pointer-events-none group-hover/step:pointer-events-auto group-hover/step:opacity-100 group-focus-within/step:pointer-events-auto group-focus-within/step:opacity-100",
              (isHover || isEditing) && "pointer-events-auto opacity-100"
            )}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <StepOverflowFlyout
              variant="noSuggestion"
              onDelete={onDeleteStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentIconsStack() {
  return (
    <div className="flex items-center pr-1">
      {(
        [
          { src: WF_FIGMA.canvasSalesforce, w: 17, h: 12 },
          { src: WF_FIGMA.canvasGemini, w: 14, h: 14 },
          { src: WF_FIGMA.canvasMicrosoft, w: 14, h: 14 },
        ] as const
      ).map((a, i) => (
        <div
          key={i}
          className="-mr-1 flex size-[27px] shrink-0 items-center justify-center rounded-full border-2 border-[#f4f4fa] bg-[#fcfcfe] p-1"
        >
          <img
            alt=""
            src={a.src}
            width={a.w}
            height={a.h}
            className="object-contain"
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}

type NewStepAgentPhase = "idle" | "loading" | "ready";

type SuggestionProps = {
  stepId: string;
  stepLabel: string;
  title: string;
  description: string;
  state: SuggestionVisualState;
  selectedAgentLabel?: string;
  agentDropdownVariant?: AgentSuggestionDropdownVariant;
  /** Figma 149:53800 + 1:8746 / 1:8858 — phased agent dropdown until suggestions load. */
  isNewStep?: boolean;
  isEditing?: boolean;
  editingField?: StepEditField | null;
  onEnterEdit?: (field: StepEditField) => void;
  onUpdateTitle?: (value: string) => void;
  onUpdateDescription?: (value: string) => void;
  onDeleteStep?: () => void;
};

const newStepFieldClass =
  "rounded-lg border border-[#dadae1] bg-white outline-none placeholder:text-[#808094] focus:border-[#4f4bff]";

/** Figma 1:8627 — agent suggestion row + card variants. */
export function WorkflowStepWithSuggestion({
  stepId,
  stepLabel,
  title,
  description,
  state,
  selectedAgentLabel: _selectedAgentLabel = "Copilot Researcher",
  agentDropdownVariant = "notSelected",
  isNewStep = false,
  isEditing = false,
  editingField = null,
  onEnterEdit = (_field: StepEditField) => {},
  onUpdateTitle = () => {},
  onUpdateDescription = () => {},
  onDeleteStep = () => {},
}: SuggestionProps) {
  const agentTriggerRef = useRef<HTMLButtonElement>(null);
  const newStepTitleRef = useRef<HTMLInputElement>(null);
  const newStepDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [newPhase, setNewPhase] = useState<NewStepAgentPhase>(() =>
    isNewStep ? "idle" : "ready"
  );
  const [panelAgent, setPanelAgent] = useState<AgentKey>("copilot");
  const [committedAgent, setCommittedAgent] = useState<AgentKey | null>(null);
  const agentDropdownCtx = useAgentDropdownOpenContext();

  useEffect(() => {
    if (!isNewStep) setNewPhase("ready");
  }, [isNewStep]);

  useEffect(() => {
    if (!isNewStep) return;
    const t = requestAnimationFrame(() => newStepTitleRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [stepId, isNewStep]);

  useEffect(() => {
    if (isNewStep) return;
    setPopoverOpen(state === "dropdownOpen");
  }, [state, isNewStep]);

  /** After “Loading AI suggestions…”, open the full agent row + popover (demo delay). */
  useEffect(() => {
    if (!isNewStep) return;
    if (newPhase !== "loading") return;
    const loadTimer = setTimeout(() => {
      setNewPhase("ready");
    }, 2600);
    return () => clearTimeout(loadTimer);
  }, [isNewStep, newPhase]);

  const startNewStepAgentLoading = useCallback(() => {
    if (!isNewStep) return;
    if (!title.trim() || !description.trim()) return;
    setNewPhase((p) => (p === "idle" ? "loading" : p));
    setPopoverOpen(true);
  }, [isNewStep, title, description]);

  useEffect(() => {
    if (state === "agentChosen") {
      setCommittedAgent((prev) => prev ?? "copilot");
    }
  }, [state]);
  useEffect(() => {
    if (committedAgent) setPanelAgent(committedAgent);
  }, [committedAgent]);

  const isDrag = state === "drag";
  const isHover = state === "hover";
  const isDropdownOpen = popoverOpen;
  const hasChosenAgent = committedAgent !== null;
  const interactive = state === "default" && !isNewStep;
  const showLoadingTrigger = isNewStep && newPhase === "loading";
  const showAgentBlock = !isNewStep || newPhase !== "idle";
  const showRegularAgentRow =
    !isNewStep || newPhase === "ready" || showLoadingTrigger;
  const cardEmphasis =
    isNewStep ||
    isHover ||
    isDropdownOpen ||
    hasChosenAgent ||
    isDrag ||
    isEditing;

  const agentStepContext = useMemo(
    () => ({ stepLabel, title, description }),
    [stepLabel, title, description]
  );

  const effectivePanelVariant = useMemo((): AgentSuggestionDropdownVariant => {
    if (isNewStep && newPhase === "loading") {
      return "loadingSuggestions";
    }
    if (
      agentDropdownVariant === "loadingHowAiHelps" ||
      agentDropdownVariant === "loadingSuggestions" ||
      agentDropdownVariant === "chosenAnotherAgent"
    ) {
      return agentDropdownVariant;
    }
    if (committedAgent !== null) {
      return "alreadySelected";
    }
    return agentDropdownVariant;
  }, [committedAgent, agentDropdownVariant, isNewStep, newPhase]);

  const handleCommitAgent = () => {
    setCommittedAgent(panelAgent);
    setPopoverOpen(false);
  };

  const handleClearSelection = () => {
    setCommittedAgent(null);
    setPanelAgent("copilot");
    setPopoverOpen(false);
  };

  const handlePopoverClose = useCallback(() => {
    if (isNewStep && newPhase === "loading") return;
    setPopoverOpen(false);
  }, [isNewStep, newPhase]);

  useEffect(() => {
    if (!agentDropdownCtx) return;
    agentDropdownCtx.setAgentDropdownOpen(stepId, isDropdownOpen);
    return () => {
      agentDropdownCtx.setAgentDropdownOpen(stepId, false);
    };
  }, [agentDropdownCtx, isDropdownOpen, stepId]);

  return (
    <div
      data-step-card
      data-workflow-step-root={stepId}
      data-new-step={isNewStep ? "" : undefined}
      data-node-id={isNewStep ? "149:53800" : undefined}
      className={cn(
        "w-full max-w-[min(432px,100%)] rounded-xl p-4 bg-[#fcfcfe] flex flex-col gap-4 border-[1.5px]",
        cardEmphasis
          ? cn(
              "border-[#4f4bff]",
              hasChosenAgent
                ? "shadow-[4px_4px_8px_0px_rgba(157,78,221,0.08)]"
                : shadowElevated
            )
          : interactive
            ? cn(
                "border-[#a5a3ff]",
                shadowCard,
                "transition-[border-color,box-shadow] duration-150",
                "group-hover/step:border-[#4f4bff] group-hover/step:shadow-[4px_4px_16px_0px_rgba(157,78,221,0.16)]"
              )
            : cn("border-[#a5a3ff]", shadowCard)
      )}
      data-state={state}
    >
      <div className="flex w-full items-start gap-2">
        <div
          className="shrink-0 self-start"
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <DragHandle />
        </div>
        <div className={cn("flex min-w-0 flex-1 items-start gap-4")}>
          <StepBadge
            label={stepLabel}
            dragStyle={isDrag}
            agentCommitted={hasChosenAgent}
          />
          {isNewStep ? (
            <div
              className="flex min-w-0 flex-1 flex-col gap-1.5 leading-[1.2]"
              data-step-editing-fields
            >
              <input
                ref={newStepTitleRef}
                type="text"
                value={title}
                onChange={(e) => onUpdateTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
                  e.preventDefault();
                  const t = title.trim();
                  const d = description.trim();
                  if (t && d) {
                    startNewStepAgentLoading();
                    return;
                  }
                  if (t) {
                    newStepDescriptionRef.current?.focus();
                  }
                }}
                placeholder="Step title"
                aria-label="Step title"
                className={cn(
                  "w-full px-2 py-1 text-[15px] font-semibold leading-[1.2] text-[#18174d]",
                  newStepFieldClass
                )}
              />
              <textarea
                ref={newStepDescriptionRef}
                value={description}
                onChange={(e) => onUpdateDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === "Enter" && !e.shiftKey) {
                    const t = title.trim();
                    const d = description.trim();
                    if (t && d) {
                      e.preventDefault();
                      startNewStepAgentLoading();
                    }
                  }
                }}
                placeholder="Add a description"
                aria-label="Step description"
                rows={3}
                className={cn(
                  "min-h-[72px] w-full resize-y px-2 py-1.5 text-[13.5px] leading-[1.2] text-[#494959]",
                  newStepFieldClass
                )}
              />
            </div>
          ) : (
            <StepEditableTextBlock
              title={title}
              description={description}
              editingField={editingField ?? null}
              interactive={interactive}
              onEnterEdit={onEnterEdit}
              onUpdateTitle={onUpdateTitle}
              onUpdateDescription={onUpdateDescription}
            />
          )}
          <div
            className={cn(
              "flex w-8 shrink-0 justify-end self-start",
              (interactive || isNewStep) &&
                "opacity-0 transition-opacity duration-150 pointer-events-none group-hover/step:pointer-events-auto group-hover/step:opacity-100 group-focus-within/step:pointer-events-auto group-focus-within/step:opacity-100",
              (isHover || isEditing || isNewStep) &&
                "pointer-events-auto opacity-100"
            )}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <StepOverflowFlyout
              variant="withSuggestion"
              onDelete={onDeleteStep}
            />
          </div>
        </div>
      </div>

      {showAgentBlock ? (
        <div className="flex w-full justify-end">
        <div className="relative w-full max-w-[392px]">
          {hasChosenAgent && committedAgent ? (
            <ChosenAgentTrigger
              ref={agentTriggerRef}
              agentId={committedAgent}
              open={isDropdownOpen}
              onClick={() => setPopoverOpen((o) => !o)}
            />
          ) : showLoadingTrigger ? (
            <button
              ref={agentTriggerRef}
              type="button"
              disabled
              aria-busy
              className={cn(
                "flex h-10 w-full cursor-wait items-center justify-between rounded-[24px] border border-[#4f4bff] bg-[#f4f4fa] py-1.5 pr-2.5 pl-3.5 text-left",
                isDropdownOpen && "ring-[1.5px] ring-[#4f4bff]/30"
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <Loader2
                  className="size-4 shrink-0 animate-spin text-[#4f4bff]"
                  aria-hidden
                />
                <p className="truncate text-[13.5px] leading-[1.2] font-normal text-[#18174d]">
                  — Loading AI suggestions
                </p>
              </div>
              <ChevronUp
                className="size-6 shrink-0 text-[#18174d]"
                strokeWidth={2}
              />
            </button>
          ) : (
            <button
              ref={agentTriggerRef}
              type="button"
              aria-expanded={isDropdownOpen}
              aria-haspopup="dialog"
              onClick={() => setPopoverOpen((o) => !o)}
              className={cn(
                "flex h-10 w-full items-center justify-between rounded-[24px] border border-[#4f4bff] bg-[#f4f4fa] py-1.5 pr-2.5 pl-3.5 text-left transition-colors",
                isDropdownOpen && "ring-[1.5px] ring-[#4f4bff]/30",
                "hover:bg-[#eceefe] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]/35"
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <p className="shrink-0 text-[13.5px] leading-[1.2] font-normal text-[#18174d]">
                  3 suitable agents found
                </p>
                <AgentIconsStack />
              </div>
              {isDropdownOpen ? (
                <ChevronUp className="size-6 shrink-0 text-[#18174d]" strokeWidth={2} />
              ) : (
                <ChevronDown className="size-6 shrink-0 text-[#18174d]" strokeWidth={2} />
              )}
            </button>
          )}
          <AgentSuggestionPopoverLayer
            open={isDropdownOpen && showRegularAgentRow}
            onClose={handlePopoverClose}
            anchorRef={agentTriggerRef}
            variant={effectivePanelVariant}
            selectedAgentId={panelAgent}
            onAgentChange={setPanelAgent}
            stepContext={agentStepContext}
            onCommitAgent={handleCommitAgent}
            onClearSelection={handleClearSelection}
          />
        </div>
      </div>
      ) : null}
    </div>
  );
}

function WorkflowStepCard({
  step,
  editingField,
  onEnterEdit,
  onUpdateTitle,
  onUpdateDescription,
  onDeleteStep,
}: {
  step: WorkflowCanvasStep;
  editingField: StepEditField | null;
  onEnterEdit: (id: string, field: StepEditField) => void;
  onUpdateTitle: (id: string, value: string) => void;
  onUpdateDescription: (id: string, value: string) => void;
  onDeleteStep: (id: string) => void;
}) {
  const isEditing = editingField !== null;
  const suggestion = Boolean(step.showAgentSuggestion);
  if (suggestion) {
    return (
      <WorkflowStepWithSuggestion
        stepId={step.id}
        stepLabel={step.stepLabel}
        title={step.title}
        description={step.description}
        state={step.suggestionState ?? "default"}
        selectedAgentLabel={step.selectedAgentLabel}
        agentDropdownVariant={step.agentDropdownVariant}
        isNewStep={step.isNew === true}
        isEditing={isEditing}
        editingField={editingField}
        onEnterEdit={(field) => onEnterEdit(step.id, field)}
        onUpdateTitle={(v) => onUpdateTitle(step.id, v)}
        onUpdateDescription={(v) => onUpdateDescription(step.id, v)}
        onDeleteStep={() => onDeleteStep(step.id)}
      />
    );
  }
  return (
    <WorkflowStepNoSuggestion
      stepId={step.id}
      stepLabel={step.stepLabel}
      title={step.title}
      description={step.description}
      state={step.noSuggestionState ?? "default"}
      isEditing={isEditing}
      editingField={editingField}
      onEnterEdit={(field) => onEnterEdit(step.id, field)}
      onUpdateTitle={(v) => onUpdateTitle(step.id, v)}
      onUpdateDescription={(v) => onUpdateDescription(step.id, v)}
      onDeleteStep={() => onDeleteStep(step.id)}
    />
  );
}

export type FinalDesignWorkflowCanvasProps = {
  steps?: WorkflowCanvasStep[];
  /** Called when step title/description change (e.g. after double-click edit). */
  onStepsChange?: (steps: WorkflowCanvasStep[]) => void;
  className?: string;
};

/**
 * Figma Key screens — vertical steps, connectors, optional agent row.
 * States: 1:8485 (no suggestion), 1:8627 (with suggestion).
 * Double-click the step title or the description (1:8540 / 1:8589) to edit that field only; Escape reverts; click outside commits.
 * “+” inserts a step using Figma 149:53800 (new-step card); empty new steps dismiss on outside click or Escape.
 */
export function FinalDesignWorkflowCanvas({
  steps: stepsProp = DEFAULT_STEPS,
  onStepsChange,
  className,
}: FinalDesignWorkflowCanvasProps) {
  const [steps, setSteps] = useState<WorkflowCanvasStep[]>(() => [...stepsProp]);
  type StepEditSession = { stepId: string; field: StepEditField };
  const [editSession, setEditSession] = useState<StepEditSession | null>(null);
  const editSessionRef = useRef<StepEditSession | null>(null);
  editSessionRef.current = editSession;
  const stepsRef = useRef(steps);
  stepsRef.current = steps;
  const editBaselineRef = useRef<{ field: StepEditField; value: string } | null>(
    null
  );

  const [openAgentDropdownStepId, setOpenAgentDropdownStepId] = useState<
    string | null
  >(null);
  const setAgentDropdownOpen = useCallback((stepId: string, open: boolean) => {
    setOpenAgentDropdownStepId((prev) => {
      if (open) return stepId;
      return prev === stepId ? null : prev;
    });
  }, []);
  const agentDropdownValue = useMemo(
    () => ({ setAgentDropdownOpen }),
    [setAgentDropdownOpen]
  );

  const commitEdit = useCallback(() => {
    setEditSession(null);
    editBaselineRef.current = null;
  }, []);

  const cancelEdit = useCallback(() => {
    const session = editSession;
    const baseline = editBaselineRef.current;
    if (!session || !baseline) return;
    setSteps((prev) => {
      const next = prev.map((s) => {
        if (s.id !== session.stepId) return s;
        if (baseline.field === "title") {
          return { ...s, title: baseline.value };
        }
        return { ...s, description: baseline.value };
      });
      onStepsChange?.(next);
      return next;
    });
    setEditSession(null);
    editBaselineRef.current = null;
  }, [editSession, onStepsChange]);

  const enterEdit = useCallback((id: string, field: StepEditField) => {
    setEditSession((prev) => {
      if (prev?.stepId === id && prev.field === field) return prev;
      const s = steps.find((x) => x.id === id);
      if (!s) return prev;
      editBaselineRef.current = {
        field,
        value: field === "title" ? s.title : s.description,
      };
      return { stepId: id, field };
    });
  }, [steps]);

  const updateTitle = useCallback(
    (id: string, value: string) => {
      setSteps((prev) => {
        const next = prev.map((x) =>
          x.id === id ? { ...x, title: value } : x
        );
        onStepsChange?.(next);
        return next;
      });
    },
    [onStepsChange]
  );

  const updateDescription = useCallback(
    (id: string, value: string) => {
      setSteps((prev) => {
        const next = prev.map((x) =>
          x.id === id ? { ...x, description: value } : x
        );
        onStepsChange?.(next);
        return next;
      });
    },
    [onStepsChange]
  );

  const finalizeNewStep = useCallback(
    (id: string) => {
      setSteps((prev) => {
        const s = prev.find((x) => x.id === id);
        if (!s?.isNew) return prev;
        if (!s.title.trim() && !s.description.trim()) {
          const next = prev.filter((x) => x.id !== id);
          onStepsChange?.(next);
          return next;
        }
        const next = prev.map((x) =>
          x.id === id ? { ...x, isNew: false } : x
        );
        onStepsChange?.(next);
        return next;
      });
    },
    [onStepsChange]
  );

  const deleteStep = useCallback(
    (id: string) => {
      setEditSession((sess) => (sess?.stepId === id ? null : sess));
      editBaselineRef.current = null;
      setSteps((prev) => {
        if (prev.length <= 1) return prev;
        const next = prev.filter((x) => x.id !== id);
        onStepsChange?.(next);
        return next;
      });
    },
    [onStepsChange]
  );

  const addStepAfter = useCallback(
    (afterId: string) => {
      setEditSession(null);
      editBaselineRef.current = null;
      setSteps((prev) => {
        const idx = prev.findIndex((s) => s.id === afterId);
        if (idx < 0) return prev;
        const next = [...prev];
        next.splice(idx + 1, 0, createNewCanvasStep(prev));
        onStepsChange?.(next);
        return next;
      });
    },
    [onStepsChange]
  );

  useEffect(() => {
    const onPointerDownCapture = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const inAgentPopover = Boolean(
        target.closest("[data-agent-suggestion-popover]")
      );
      const inStepOverflow = Boolean(
        target.closest("[data-workflow-step-overflow-panel]")
      );

      const editingId = editSessionRef.current?.stepId;
      if (editingId && !inAgentPopover) {
        const root = document.querySelector(
          `[data-workflow-step-root="${globalThis.CSS.escape(editingId)}"]`
        );
        if (!root?.contains(target)) {
          commitEdit();
        }
      }

      if (inAgentPopover || inStepOverflow) return;

      const currentSteps = stepsRef.current;
      for (const s of currentSteps) {
        if (!s.isNew) continue;
        const root = document.querySelector(
          `[data-workflow-step-root="${globalThis.CSS.escape(s.id)}"]`
        );
        if (root?.contains(target)) continue;
        finalizeNewStep(s.id);
      }
    };
    document.addEventListener("pointerdown", onPointerDownCapture, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDownCapture, true);
  }, [commitEdit, finalizeNewStep]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (openAgentDropdownStepId !== null) return;

      if (editSessionRef.current) {
        e.preventDefault();
        cancelEdit();
        return;
      }

      const currentSteps = stepsRef.current;
      if (!currentSteps.some((s) => s.isNew)) return;
      e.preventDefault();
      setSteps((prev) => {
        const next = prev
          .filter(
            (s) =>
              !s.isNew ||
              s.title.trim() !== "" ||
              s.description.trim() !== ""
          )
          .map((s) => (s.isNew ? { ...s, isNew: false } : s));
        onStepsChange?.(next);
        return next;
      });
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openAgentDropdownStepId, cancelEdit, onStepsChange]);

  return (
    <AgentDropdownOpenContext.Provider value={agentDropdownValue}>
      <div
        className={cn(
          "flex w-full flex-col gap-6 font-[Inter,sans-serif] lg:flex-row lg:items-start lg:justify-between lg:gap-8",
          className
        )}
        data-name="Workflow"
      >
        <div
          className="flex min-w-0 flex-1 flex-col items-center"
          data-name="Workflow steps"
          data-node-id="1:20867"
        >
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const suggestion = Boolean(step.showAgentSuggestion);
            const ns = step.noSuggestionState ?? "default";
            const ss = step.suggestionState ?? "default";
            const isPlaceholder = !suggestion && ns === "placeholder";
            const explicitHover =
              (!suggestion && ns === "hover") ||
              (suggestion && ss === "hover");
            const hideFloatingAdd =
              (openAgentDropdownStepId !== null &&
                openAgentDropdownStepId === step.id) ||
              step.isNew;

            return (
              <div
                key={step.id}
                className={cn(
                  "group/step relative flex w-full flex-col items-center",
                  isLast && "pb-5"
                )}
              >
                <div className="relative w-full max-w-[min(432px,100%)]">
                  <WorkflowStepCard
                    step={step}
                    editingField={
                      editSession?.stepId === step.id
                        ? editSession.field
                        : null
                    }
                    onEnterEdit={enterEdit}
                    onUpdateTitle={updateTitle}
                    onUpdateDescription={updateDescription}
                    onDeleteStep={deleteStep}
                  />
                  {!isPlaceholder && !hideFloatingAdd ? (
                    <FloatingAddStepAfterButton
                      forceVisible={explicitHover}
                      onClick={() => addStepAfter(step.id)}
                    />
                  ) : null}
                </div>
                <WorkflowStepConnector visible={!isLast} />
              </div>
            );
          })}
        </div>

        <aside
          className="w-full shrink-0 lg:sticky lg:top-6 lg:w-auto lg:max-w-[372px] lg:self-start"
          data-name="Details rail"
        >
          <WorkflowCanvasDetailsPanel
            steps={steps}
            variant="panel"
            className="mb-0"
          />
        </aside>
      </div>
    </AgentDropdownOpenContext.Provider>
  );
}

export { DEFAULT_STEPS };
export type { AgentKey, AgentSuggestionDropdownVariant } from "./AgentSuggestionDropdown";
