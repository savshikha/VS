import {
  ArrowRight,
  CheckCircle2,
  Download,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FinalDesignWorkflowCanvas,
  type WorkflowCanvasStep,
} from "./FinalDesignWorkflowCanvas";

export type WorkflowEditorBarState = "day0" | "draft";

/** Shown beside the draft badge when `barState` is `"draft"`. */
export type WorkflowSaveStatus = "saving" | "saved";

export type FinalDesignWorkflowEditorPanelProps = {
  /** `day0` — system-generated label, publish disabled. `draft` — version + draft pill + save status (Figma 1:50251). */
  barState?: WorkflowEditorBarState;
  /** Primary label when `barState` is `day0`. */
  title?: string;
  /** e.g. "Version 1" when `barState` is `draft`. */
  versionLabel?: string;
  /** Save line when `barState` is `draft`. */
  saveStatus?: WorkflowSaveStatus;
  /** Workflow canvas steps (Figma 1:20867). */
  workflowSteps?: WorkflowCanvasStep[];
  className?: string;
};

/**
 * Figma Key screens — Group 5589 (122:53696): workflow bar + grid canvas.
 * Draft bar: node 1:50251 (Version 1, Draft pill, save status, refresh + download + gradient publish).
 */
export function FinalDesignWorkflowEditorPanel({
  barState = "day0",
  title = "System generated workflow",
  versionLabel = "Version 1",
  saveStatus = "saved",
  workflowSteps,
  className,
}: FinalDesignWorkflowEditorPanelProps) {
  const isDraft = barState === "draft";

  return (
    <div
      className={cn(
        "flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#dfdfe4] bg-white shadow-[0_1px_0_rgba(24,23,77,0.04)]",
        className
      )}
      data-node-id="122:53696"
      data-name="Group 5589"
      data-workflow-bar-state={barState}
    >
      <header
        className="flex shrink-0 items-center justify-between gap-4 border-b border-[#dfdfe4] bg-white px-6 py-[15px]"
        data-node-id={isDraft ? "1:14277" : "122:53448"}
        data-name="Top bar"
      >
        {isDraft ? (
          <>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <h2 className="shrink-0 text-[21px] font-semibold leading-snug tracking-tight text-[#18174d]">
                {versionLabel}
              </h2>
              <span className="shrink-0 rounded-full bg-[#f3eafb] px-2 py-0.5 text-[14px] font-semibold leading-[1.2] text-[#9d4edd]">
                Draft
              </span>
              <div
                className="flex min-w-0 items-center gap-1 text-[16px] font-medium leading-[1.2] text-[#494959]"
                aria-live="polite"
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2
                      className="size-6 shrink-0 animate-spin text-[#494959]"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span>Saving changes…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      className="size-6 shrink-0 text-[#494959]"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span>Saved changes</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f7f8] text-[#494959] transition-colors hover:bg-[#ececf0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]/35"
                aria-label="Refresh"
              >
                <RotateCcw className="size-4" strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f7f8] text-[#494959] transition-colors hover:bg-[#ececf0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]/35"
                aria-label="Download"
              >
                <Download className="size-4" strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-b from-[#4f4bff] to-[#9747ff] px-4 py-3 text-[16px] font-semibold leading-[1.2] text-white shadow-sm transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]/50"
                aria-label="Publish workflow"
              >
                <span>Publish workflow</span>
                <ArrowRight className="size-4 shrink-0" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[21px] font-semibold leading-snug tracking-tight text-[#18174d]">
                {title}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f7f8] text-[#494959] transition-colors hover:bg-[#ececf0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]/35"
                aria-label="Download"
              >
                <Download className="size-4" strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                disabled
                className="flex h-10 shrink-0 cursor-not-allowed items-center gap-2 rounded-xl bg-[#f7f7f8] px-4 py-3 text-[16px] font-semibold leading-[1.2] text-[#808094] opacity-80"
                aria-label="Publish workflow (unavailable)"
              >
                <span>Publish workflow</span>
                <ArrowRight className="size-4 shrink-0" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </>
        )}
      </header>

      <div
        className="relative min-h-[min(60vh,900px)] w-full flex-1 overflow-auto bg-[#f5f5f5]"
        data-node-id="122:47624"
        data-name="Frame 2018782037"
        aria-label="Workflow canvas"
        style={{
          backgroundImage: `
            linear-gradient(rgba(24, 23, 77, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(24, 23, 77, 0.08) 1px, transparent 1px),
            linear-gradient(rgba(24, 23, 77, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(24, 23, 77, 0.045) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px, 100px 100px, 10px 10px, 10px 10px",
        }}
      >
        <div className="relative z-[1] mx-auto w-full max-w-[min(1000px,calc(100%-1rem))] py-8 pl-8 pr-4 sm:py-10 sm:pl-10 sm:pr-6">
          <FinalDesignWorkflowCanvas steps={workflowSteps} />
        </div>
      </div>
    </div>
  );
}
