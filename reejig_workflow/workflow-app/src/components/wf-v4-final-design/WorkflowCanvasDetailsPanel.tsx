import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENT_OPTIONS, type AgentKey } from "./AgentSuggestionDropdown";
import { WF_FIGMA } from "./mcpFigmaIconUrls";

/** Subset of `WorkflowCanvasStep` used for 1:9461 stats (avoids circular imports). */
export type WorkflowCanvasStepStats = {
  showAgentSuggestion?: boolean;
  durationMinutes?: number;
};

const statTitleClass =
  "text-[16px] font-normal leading-[1.2] text-[#18174d]";

const NOTES_MAX = 200;

/**
 * Notes: double-click read-only area to edit; click outside commits; Escape cancels.
 * In edit mode, title + char count share one row; count hidden when read-only.
 */
function DetailsNotesSection({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const rootRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (!isEditing) setDraft(value);
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing) taRef.current?.focus();
  }, [isEditing]);

  const beginEdit = () => {
    setDraft(value.slice(0, NOTES_MAX));
    setIsEditing(true);
  };

  const commitAndClose = useCallback(() => {
    onChange(draftRef.current.slice(0, NOTES_MAX));
    setIsEditing(false);
  }, [onChange]);

  useEffect(() => {
    if (!isEditing) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      commitAndClose();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isEditing, commitAndClose]);

  useEffect(() => {
    if (!isEditing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDraft(value);
        setIsEditing(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isEditing, value]);

  const hasText = value.trim().length > 0;

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex w-full min-w-0 gap-3",
        !isEditing && !hasText && "min-h-[78px]"
      )}
      data-name="Notes"
      data-node-id="1:9699"
      data-notes-state={
        isEditing
          ? draft.length > 0
            ? "editing-with-text"
            : "editing-empty"
          : hasText
            ? "saved"
            : "empty"
      }
    >
      <div
        className="w-1 shrink-0 self-stretch rounded-[2px] bg-[#808094]"
        aria-hidden
      />
      <div className="min-w-0 w-full flex-1">
        {isEditing ? (
          <div className="w-full">
            <div className="flex items-baseline justify-between gap-3">
              <p className={statTitleClass}>Notes</p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraft("");
                    taRef.current?.focus();
                  }}
                  className="inline-flex size-6 items-center justify-center rounded-md text-[#808094] transition-colors hover:bg-[#f4f4fa] hover:text-[#4f4bff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#4f4bff]"
                  aria-label="Clear notes"
                  title="Clear notes"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
                <p
                  className="text-[16px] leading-[1.2]"
                  aria-live="polite"
                >
                  <span className="text-[#494959]">{draft.length}</span>
                  <span className="text-[#808094]">/{NOTES_MAX}</span>
                </p>
              </div>
            </div>
            <textarea
              ref={taRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, NOTES_MAX))}
              rows={4}
              className={cn(
                "mt-1 min-h-[80px] w-full resize-y rounded-lg border border-[#4f4bff] bg-white p-3",
                "font-[Inter,sans-serif] text-[16px] leading-[1.2] text-[#18174d] outline-none",
                "focus-visible:ring-2 focus-visible:ring-[#4f4bff]/25"
              )}
              aria-label="Notes"
            />
          </div>
        ) : (
          <>
            <p className={statTitleClass}>Notes</p>
            <div
              className={cn(
                "mt-1 flex w-full cursor-text rounded-[9px] bg-[rgba(244,244,250,0.99)] p-3 select-text",
                hasText ? "min-h-[66px] items-start" : "h-[45px] items-center"
              )}
              data-node-id={hasText ? "1:9717" : "1:9707"}
              onDoubleClick={(e) => {
                e.preventDefault();
                beginEdit();
              }}
              title="Double-click to edit"
              role="presentation"
            >
              {hasText ? (
                <p className="font-[Inter,sans-serif] text-[16px] leading-[1.33] text-[#18174d]">
                  {value}
                </p>
              ) : (
                <p className="font-[Inter,sans-serif] text-[16px] leading-[1.33] text-[#808094]">
                  No notes added
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Figma 1:9461 — “Time taken” copy uses “mins”. */
function formatTimeTakenLabel(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0 mins";
  if (totalMinutes < 60) {
    return totalMinutes === 1 ? "1 min" : `${totalMinutes} mins`;
  }
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
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
        className={cn("w-1 shrink-0 self-stretch rounded-[2px]", accentClass)}
        aria-hidden
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function useCanvasDetailsStats(steps: WorkflowCanvasStepStats[]) {
  return useMemo(() => {
    const n = steps.length;
    const withSuggestion = steps.filter((s) => s.showAgentSuggestion).length;
    const aiPotentialPct =
      n === 0 ? 0 : Math.round((withSuggestion / n) * 100);
    const summed = steps.reduce(
      (sum, s) => sum + (s.durationMinutes ?? 0),
      0
    );
    const totalMinutes =
      summed > 0 ? summed : (n > 0 ? n * 45 : 0);
    const timeLabel = formatTimeTakenLabel(totalMinutes);
    const demoAgent: AgentKey = "copilot";
    const firstAgentLabel =
      withSuggestion > 0 ? AGENT_OPTIONS[demoAgent].label : "";
    const othersCount = Math.max(0, withSuggestion - 1);
    return {
      aiPotentialPct,
      timeLabel,
      firstAgentLabel,
      othersCount,
      showAgent: withSuggestion > 0,
      demoAgent,
    };
  }, [steps]);
}

export type WorkflowCanvasDetailsPanelProps = {
  steps: WorkflowCanvasStepStats[];
  className?: string;
  /**
   * `embedded` — wide horizontal stats (legacy / other layouts).
   * `panel` — Figma 1:9461 Details card (MCP): white shell, title, sections + Notes.
   */
  variant?: "embedded" | "panel";
  notes?: string;
  onNotesChange?: (value: string) => void;
};

/**
 * Figma Key screens 1:9461 — `get_design_context` (node 1:9461): Details card with
 * AI potential, Time taken, AI agents used in this flow, Notes (edit via pencil on Notes only).
 */
export function WorkflowCanvasDetailsPanel({
  steps,
  className,
  variant = "embedded",
  notes: notesProp,
  onNotesChange,
}: WorkflowCanvasDetailsPanelProps) {
  const {
    aiPotentialPct,
    timeLabel,
    firstAgentLabel,
    othersCount,
    showAgent,
    demoAgent,
  } = useCanvasDetailsStats(steps);

  const agentMeta = AGENT_OPTIONS[demoAgent];

  const [notesLocal, setNotesLocal] = useState("");
  const isNotesControlled = notesProp !== undefined;
  const notesValue = isNotesControlled ? notesProp : notesLocal;
  const setNotes = (v: string) => {
    onNotesChange?.(v);
    if (!isNotesControlled) setNotesLocal(v);
  };

  const statsRow = (
    <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-6 lg:gap-8">
      <DetailAccentRow
        className="min-w-0 w-full sm:w-auto sm:shrink-0 sm:basis-auto sm:flex-none"
        accentClass="bg-[#1e83ad]"
      >
        <div className="flex flex-col gap-1">
          <p className={statTitleClass}>AI potential</p>
          <div className="flex items-center gap-[5px]">
            <span className="flex size-[32.5px] shrink-0 items-center justify-center rounded-full bg-[#e5f7ff]">
              <img
                alt=""
                className="max-h-[17px] max-w-[17px] shrink-0 object-contain"
                src={WF_FIGMA.statsPieChart}
                decoding="async"
              />
            </span>
            <p className="text-2xl font-bold leading-none whitespace-nowrap text-[#18174d]">
              {aiPotentialPct}%
            </p>
          </div>
        </div>
      </DetailAccentRow>

      <DetailAccentRow
        className="min-w-0 w-full sm:w-auto sm:shrink-0 sm:basis-auto sm:flex-none sm:min-w-min"
        accentClass="bg-[#d47b4e]"
      >
        <div className="flex flex-col gap-1">
          <p className={statTitleClass}>Time taken</p>
          <div className="flex items-center gap-[5px]">
            <span className="flex size-[32.5px] shrink-0 items-center justify-center rounded-full bg-[#fff2ec]">
              <img
                alt=""
                className="max-h-[17px] max-w-[17px] shrink-0 object-contain"
                src={WF_FIGMA.statsHourglass}
                decoding="async"
              />
            </span>
            <p className="text-2xl font-bold leading-none whitespace-nowrap text-[#18174d]">
              {timeLabel}
            </p>
          </div>
        </div>
      </DetailAccentRow>

      <DetailAccentRow
        className="min-w-0 w-full sm:min-w-0 sm:w-auto sm:flex-1 sm:basis-0 sm:shrink"
        accentClass="bg-[#808094]"
      >
        <div className="flex flex-col gap-1">
          <p className={statTitleClass}>AI agents used in this flow</p>
          <div className="flex items-center gap-2.5">
            <span className="flex size-[39px] shrink-0 items-center justify-center self-center rounded-full bg-[#f4f4fa] p-[6.635px]">
              {showAgent ? (
                <span className="relative size-[19.5px] overflow-hidden">
                  <img
                    alt=""
                    src={agentMeta.iconSrc}
                    className={cn(
                      "size-full object-contain",
                      agentMeta.iconClassName
                    )}
                    decoding="async"
                  />
                </span>
              ) : (
                <span className="text-[10px] text-[#808094]">—</span>
              )}
            </span>
            <div className="min-w-0 flex flex-1 flex-wrap content-center items-center gap-x-1 text-[13.593px] leading-snug">
              {showAgent && firstAgentLabel ? (
                <>
                  <span className="font-semibold text-[#18174d]">
                    {firstAgentLabel}
                  </span>
                  {othersCount > 0 ? (
                    <>
                      <span className="font-normal text-[#18174d]">and</span>
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

  /** Figma MCP 1:9463 — white bordered card, 24px padding, 16px radius, 372px frame width. */
  const panelFromFigma = (
    <div className="w-full max-w-[372px]">
      <div
        className="w-full rounded-2xl border border-[#dfdfe4] bg-white p-6 shadow-[0_1px_0_rgba(24,23,77,0.04)]"
        data-node-id="1:9463"
      >
        <div className="flex flex-col gap-6">
          <h2
            className="shrink-0 text-[21px] font-semibold leading-snug tracking-tight text-[#18174d]"
            data-node-id="1:9466"
          >
            Details
          </h2>

          <div className="flex flex-col gap-[29px]" data-node-id="1:9467">
            {/* AI potential — same stretch pattern as Time taken so accent bar height matches */}
            <div
              className="flex min-h-[62px] items-stretch gap-3"
              data-node-id="1:9468"
            >
              <div
                className="w-1 shrink-0 self-stretch rounded-[2px] bg-[#1e83ad]"
                data-node-id="1:9469"
                aria-hidden
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <p className={statTitleClass} data-node-id="1:9471">
                  AI potential
                </p>
                <div className="flex items-center gap-[5px]" data-node-id="1:9472">
                  <span
                    className="flex size-[32.5px] shrink-0 items-center justify-center rounded-full bg-[#e5f7ff]"
                    data-name="Icon"
                  >
                    <img
                      alt=""
                      className="size-[17px] object-contain"
                      src={WF_FIGMA.statsPieChart}
                      decoding="async"
                    />
                  </span>
                  <p
                    className="font-[Inter,sans-serif] text-2xl font-bold leading-none whitespace-nowrap text-[#18174d]"
                    data-node-id="1:9475"
                  >
                    {aiPotentialPct}%
                  </p>
                </div>
              </div>
            </div>

            {/* Time taken — read-only (no edit control) */}
            <div className="min-h-[62px] w-full" data-name="Time taken">
              <div className="flex min-h-[62px] items-stretch gap-3">
                <div
                  className="w-1 shrink-0 self-stretch rounded-[2px] bg-[#d47b4e]"
                  aria-hidden
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className={statTitleClass}>Time taken</p>
                  <div className="flex items-center gap-[5px]">
                    <span className="flex size-[32.5px] shrink-0 items-center justify-center rounded-full bg-[#fff2ec]">
                      <img
                        alt=""
                        className="size-[17px] object-contain"
                        src={WF_FIGMA.statsHourglass}
                        decoding="async"
                      />
                    </span>
                    <p className="text-2xl font-bold leading-none text-[#18174d]">
                      {timeLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI agents used in this flow */}
            <div className="flex items-center gap-3">
              <div
                className="min-h-[48px] w-1 shrink-0 self-stretch rounded-[2px] bg-[#808094]"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className={statTitleClass}>AI agents used in this flow</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className="flex size-[39px] shrink-0 items-center justify-center rounded-[108px] bg-[#f4f4fa] p-[6.635px]">
                    {showAgent ? (
                      <span className="relative size-[19.5px] overflow-hidden">
                        <img
                          alt=""
                          src={agentMeta.iconSrc}
                          className={cn(
                            "size-full object-contain",
                            agentMeta.iconClassName
                          )}
                          decoding="async"
                        />
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#808094]">—</span>
                    )}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-[13.593px] leading-[1.2]">
                    {showAgent && firstAgentLabel ? (
                      <>
                        <span className="font-semibold text-[#18174d]">
                          {firstAgentLabel}
                        </span>
                        {othersCount > 0 ? (
                          <>
                            <span className="font-normal text-[#18174d]">
                              {" "}
                              and{" "}
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
            </div>

            {/* Notes — Figma 1:9699 (states: no input, hover, edit, input added, saved) */}
            <DetailsNotesSection value={notesValue} onChange={setNotes} />
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === "embedded") {
    return (
      <div
        className={cn("mb-5 w-full min-w-0 text-left", className)}
        data-node-id="1:9461"
        data-name="Details"
        role="region"
        aria-label="Workflow statistics"
      >
        {statsRow}
      </div>
    );
  }

  return (
    <div
      className={cn("mb-5 w-full min-w-0", className)}
      data-node-id="1:9461"
      data-name="Details"
      role="region"
      aria-label="Workflow statistics"
    >
      {panelFromFigma}
    </div>
  );
}
