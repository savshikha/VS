import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { WF_FIGMA } from "./mcpFigmaIconUrls";

const POPOVER_Z = 10_000;
const PANEL_WIDTH = 392;

/** Keys for the three demo agents in the dropdown. */
export type AgentKey = "copilot" | "grammarly" | "salesforce";

/** 1:8662 / 1:8820 — labels + Figma raster icons. */
export const AGENT_OPTIONS: Record<
  AgentKey,
  { label: string; iconSrc: string; iconClassName?: string }
> = {
  copilot: { label: "Copilot Researcher", iconSrc: WF_FIGMA.agentMicrosoft },
  grammarly: { label: "Grammarly editor", iconSrc: WF_FIGMA.agentGemini },
  salesforce: {
    label: "Custom researcher",
    iconSrc: WF_FIGMA.agentSalesforce,
    iconClassName: "scale-90",
  },
};

export function getAgentLabel(id: AgentKey): string {
  return AGENT_OPTIONS[id].label;
}

type ChosenAgentTriggerProps = {
  agentId: AgentKey;
  open: boolean;
  onClick: () => void;
};

/**
 * Figma 1:8662 (step row) + 1:8754 (default / hover / open) — chosen agent pill on the card.
 */
export const ChosenAgentTrigger = forwardRef<
  HTMLButtonElement,
  ChosenAgentTriggerProps
>(function ChosenAgentTrigger({ agentId, open, onClick }, ref) {
  const meta = AGENT_OPTIONS[agentId];
  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={open}
      aria-haspopup="dialog"
      onClick={onClick}
      className={cn(
        "flex h-10 w-full max-w-[392px] items-center justify-between rounded-[24px] border-[0.85px] border-[#4f4bff] py-[7px] pl-1 pr-2.5 text-left transition-colors",
        open
          ? "bg-[#ededfe]"
          : "bg-gradient-to-b from-[rgba(79,75,255,0.16)] to-[rgba(151,71,255,0.16)] hover:bg-[#ededfe]"
      )}
    >
      <span className="flex min-w-0 items-center gap-[7px]">
        <span className="flex size-[31px] shrink-0 items-center justify-center rounded-full bg-[#fcfcfe] p-1.5">
          <span className="relative size-[15px] overflow-hidden">
            <img
              alt=""
              src={meta.iconSrc}
              className={cn("size-full object-contain", meta.iconClassName)}
              decoding="async"
            />
          </span>
        </span>
        <span className="truncate text-[13.5px] font-normal leading-[1.2] text-[#18174d]">
          {meta.label}
        </span>
      </span>
      {open ? (
        <ChevronUp className="size-6 shrink-0 text-[#18174d]" strokeWidth={2} aria-hidden />
      ) : (
        <ChevronDown className="size-6 shrink-0 text-[#18174d]" strokeWidth={2} aria-hidden />
      )}
    </button>
  );
});

export type StepContextForAgentHelp = {
  stepLabel: string;
  title: string;
  description: string;
};

/** “How AI helps” copy varies by agent and the current workflow step. */
export function getHowAiHelpsBody(
  agentId: AgentKey,
  _ctx: StepContextForAgentHelp
): string {
  switch (agentId) {
    case "copilot":
      return `Copilot Researcher drafts evidence-backed summaries, compares benchmarks, and suggests next actions so managers can roll out training with less manual analysis.`;
    case "grammarly":
      return `Grammarly editor tightens program outlines, manager comms, and participant-facing copy for clarity, tone, and consistency with your org.`;
    case "salesforce":
      return `Custom researcher ties CRM milestones, cohorts, and follow-ups so rollout data stays aligned with this program.`;
    default:
      return `The selected agent aligns suggestions with this step’s outcomes and your workflow context.`;
  }
}

export type AgentSuggestionDropdownVariant =
  | "notSelected"
  | "alreadySelected"
  | "loadingHowAiHelps"
  | "loadingSuggestions"
  | "chosenAnotherAgent";

type AgentPillProps = {
  label: string;
  iconSrc: string;
  iconClassName?: string;
  selected?: boolean;
  onClick?: () => void;
};

/** 1:44413 — agent pill default vs selected. */
export function AgentPill({
  label,
  iconSrc,
  iconClassName,
  selected = false,
  onClick,
}: AgentPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-[35px] shrink-0 items-center rounded-[22px] border-[0.762px] pl-[5px] pr-[9px] transition-colors",
        selected
          ? "border-[#4f4bff] bg-[#4f4bff] text-white"
          : "border-[#a5a3ff] bg-[#f7f7f8] text-[#18174d] hover:bg-[#eceef5]"
      )}
    >
      <span className="flex items-center gap-[6px]">
        <span
          className={cn(
            "flex size-[27px] shrink-0 items-center justify-center rounded-full bg-[#fcfcfe] p-[5px]",
            selected && "bg-[#fcfcfe]"
          )}
        >
          <span className="relative size-[14px] overflow-hidden">
            <img
              alt=""
              src={iconSrc}
              className={cn("size-full object-contain", iconClassName)}
              decoding="async"
            />
          </span>
        </span>
        <span
          className={cn(
            "max-w-[140px] truncate text-left text-[12px] leading-[1.2]",
            selected ? "font-medium text-white" : "font-normal"
          )}
        >
          {label}
        </span>
      </span>
    </button>
  );
}

type AddAnotherAgentPillProps = {
  onClick?: () => void;
  className?: string;
};

/** Figma 1:9685 — dashed “Another agent”; SVG stroke for sparser dashes than CSS `border-dashed`. */
export function AddAnotherAgentPill({ onClick, className }: AddAnotherAgentPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex h-[35px] shrink-0 items-center gap-[3px] overflow-visible rounded-[22px] border-0 bg-[#f7f7f8] px-3 text-[12px] leading-[1.2] text-[#18174d] transition-colors",
        "hover:bg-[#f8f7ff] hover:text-[#4f4bff]",
        className
      )}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-[#4f4bff]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect
          x="0.381"
          y="0.381"
          width="calc(100% - 0.762px)"
          height="calc(100% - 0.762px)"
          rx="17.5"
          ry="17.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.762"
          strokeDasharray="5 14"
          vectorEffect="nonScalingStroke"
        />
      </svg>
      <Plus className="relative z-[1] size-[14px] shrink-0" strokeWidth={2} aria-hidden />
      <span className="relative z-[1]">Another agent</span>
    </button>
  );
}

function HowAiHelpsBlock({
  heading = "How AI helps (Example)",
  body,
}: {
  heading?: string;
  body: string;
}) {
  return (
    <div className="flex min-h-0 w-full flex-col gap-2">
      <h3 className="shrink-0 text-[16px] font-semibold leading-[1.2] text-[#18174d]">
        {heading}
      </h3>
      <div className="min-h-0 max-h-[min(220px,40vh)] overflow-y-auto rounded-[9px] bg-[rgba(244,244,250,0.99)] p-3">
        <p className="text-[16px] font-normal leading-[1.33] text-[#18174d]">
          {body}
        </p>
      </div>
    </div>
  );
}

function DropdownSpinner({ message }: { message: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-[9px] py-2">
      <Loader2
        className="size-6 shrink-0 animate-spin text-[#4f4bff]"
        aria-hidden
      />
      <p className="max-w-[264px] text-center text-[16px] font-normal leading-[1.2] text-[#808094]">
        {message}
      </p>
    </div>
  );
}

export type SuggestionDropdownPanelProps = {
  variant: AgentSuggestionDropdownVariant;
  className?: string;
  /** Controlled selection for agent pills + “How AI helps” body. */
  selectedAgentId: AgentKey;
  onAgentChange: (id: AgentKey) => void;
  stepContext: StepContextForAgentHelp;
  /** Figma 1:8791 — commit selection (closes popover in parent). */
  onCommitAgent?: () => void;
  /** Figma 1:8820 — clear committed agent. */
  onClearSelection?: () => void;
};

/**
 * Figma 1:8791 — popover body: suitable agents, how AI helps, actions.
 */
export function SuggestionDropdownPanel({
  variant,
  className,
  selectedAgentId,
  onAgentChange,
  stepContext,
  onCommitAgent,
  onClearSelection,
}: SuggestionDropdownPanelProps) {
  const isNotSelected = variant === "notSelected";
  const isAlreadySelected = variant === "alreadySelected";
  const isChosenAnother = variant === "chosenAnotherAgent";
  const isLoadingHow = variant === "loadingHowAiHelps";
  const isLoadingSuggestions = variant === "loadingSuggestions";

  const showAgentGrid = isNotSelected || isAlreadySelected;
  const showHowSectionBelowAgents = isNotSelected || isAlreadySelected;
  const showPrimarySecondaryRow = isNotSelected || isAlreadySelected;
  const showChosenActions = isChosenAnother;

  const howAiBody = getHowAiHelpsBody(selectedAgentId, stepContext);

  if (isLoadingHow || isLoadingSuggestions) {
    return (
      <div
        data-node-id={isLoadingSuggestions ? "1:8858" : undefined}
        data-name={
          isLoadingSuggestions
            ? "Agent suggestions loading"
            : "How AI helps loading"
        }
        className={cn(
          "max-h-[min(240px,calc(100dvh-32px))] w-[392px] max-w-[min(392px,calc(100vw-2rem))] rounded-2xl border border-[#a5a3ff] bg-white p-6 shadow-[0px_8px_16px_0px_rgba(0,0,0,0.12)]",
          className
        )}
      >
        <DropdownSpinner
          message={
            isLoadingSuggestions
              ? "Loading agent suggestions"
              : "Formulating how the agent helps"
          }
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex max-h-[min(560px,calc(100dvh-32px))] w-[392px] max-w-[min(392px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#a5a3ff] bg-white shadow-[0px_8px_16px_0px_rgba(0,0,0,0.12)]",
        className
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
        {showAgentGrid && (
          <section className="flex flex-col gap-2">
            <h3 className="text-[16px] font-semibold leading-[1.2] text-[#18174d]">
              Suitable agents
            </h3>
            <div className="flex flex-col gap-3 rounded-2xl bg-white">
              <div className="flex flex-wrap gap-[7px] gap-y-2">
                <AgentPill
                  label="Copilot Researcher"
                  iconSrc={WF_FIGMA.agentMicrosoft}
                  selected={selectedAgentId === "copilot"}
                  onClick={() => onAgentChange("copilot")}
                />
                <AgentPill
                  label="Grammarly editor"
                  iconSrc={WF_FIGMA.agentGemini}
                  selected={selectedAgentId === "grammarly"}
                  onClick={() => onAgentChange("grammarly")}
                />
              </div>
              <div className="flex flex-wrap items-start gap-3">
                <AgentPill
                  label="Custom researcher"
                  iconSrc={WF_FIGMA.agentSalesforce}
                  iconClassName="scale-90"
                  selected={selectedAgentId === "salesforce"}
                  onClick={() => onAgentChange("salesforce")}
                />
                <AddAnotherAgentPill />
              </div>
            </div>
          </section>
        )}

        {isChosenAnother && (
          <HowAiHelpsBlock body={howAiBody} />
        )}

        {showHowSectionBelowAgents && <HowAiHelpsBlock body={howAiBody} />}

        {showPrimarySecondaryRow && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isAlreadySelected}
              className={cn(
                "flex h-10 shrink-0 items-center justify-center rounded-xl px-4 py-3 text-[16px] font-normal leading-[1.2] transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]/50",
                isAlreadySelected
                  ? "cursor-not-allowed bg-[#f7f7f8] text-[#808094] opacity-80"
                  : "bg-gradient-to-b from-[#4f4bff] to-[#9747ff] text-white shadow-sm hover:opacity-95"
              )}
              onClick={() => onCommitAgent?.()}
            >
              Choose this agent
            </button>
            {isAlreadySelected && (
              <button
                type="button"
                className="flex h-10 shrink-0 items-center justify-center rounded-xl border border-[#a5a3ff] bg-white px-4 py-3 text-[16px] font-normal leading-[1.2] text-[#18174d] transition-colors hover:bg-[#fafafc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]/35"
                onClick={() => onClearSelection?.()}
              >
                Clear selection
              </button>
            )}
          </div>
        )}

        {showChosenActions && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="flex h-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#4f4bff] to-[#9747ff] px-4 py-3 text-[16px] font-normal leading-[1.2] text-white shadow-sm transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]/50"
            >
              Choose another agent
            </button>
            <button
              type="button"
              className="flex h-10 shrink-0 items-center justify-center rounded-xl border border-[#a5a3ff] bg-white px-4 py-3 text-[16px] font-normal leading-[1.2] text-[#18174d] transition-colors hover:bg-[#fafafc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]/35"
              onClick={() => onClearSelection?.()}
            >
              Clear selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

type AgentSuggestionPopoverLayerProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  variant: AgentSuggestionDropdownVariant;
  selectedAgentId: AgentKey;
  onAgentChange: (id: AgentKey) => void;
  stepContext: StepContextForAgentHelp;
  onCommitAgent?: () => void;
  onClearSelection?: () => void;
};

/**
 * Portal + fixed positioning so the panel sits above scroll/overflow parents (e.g. workflow editor).
 * Always opens **below** the anchor; horizontal clamp only. Closes on outside pointer down and Escape.
 */
export function AgentSuggestionPopoverLayer({
  open,
  onClose,
  anchorRef,
  variant,
  selectedAgentId,
  onAgentChange,
  stepContext,
  onCommitAgent,
  onClearSelection,
}: AgentSuggestionPopoverLayerProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const pad = 16;
    const vw = window.innerWidth;
    const panelW = Math.min(PANEL_WIDTH, vw - 2 * pad);
    let left = r.left;
    if (left + panelW > vw - pad) {
      left = Math.max(pad, vw - pad - panelW);
    }

    const gap = 8;
    // Always below the trigger (no flip above).
    const top = r.bottom + gap;

    setPos({ top, left });
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const raf = requestAnimationFrame(() => {
      updatePosition();
    });
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition, variant, selectedAgentId, stepContext.title, stepContext.description]);

  useEffect(() => {
    if (!open) return;
    const el = popoverRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      updatePosition();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, updatePosition, variant, selectedAgentId, stepContext]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={popoverRef}
      data-agent-suggestion-popover
      className="pointer-events-auto w-[min(392px,calc(100vw-32px))] max-w-[calc(100vw-32px)]"
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: POPOVER_Z }}
      role="dialog"
      aria-label="Agent suggestions"
      onClick={(e) => e.stopPropagation()}
    >
      <SuggestionDropdownPanel
        variant={variant}
        selectedAgentId={selectedAgentId}
        onAgentChange={onAgentChange}
        stepContext={stepContext}
        onCommitAgent={onCommitAgent}
        onClearSelection={onClearSelection}
      />
    </div>,
    document.body
  );
}
