import { useId } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WORKFLOW_DIRECTION_ITERATIONS } from "@/data/workflow";

const RAIL_WIDTH_PX = 320;

export type DirectionPivotTag = { kind: "pro" | "con"; label: string };

type Explainer = { title: string; body: string; tags?: DirectionPivotTag[] };

type DirectionsExploredPivotRailProps = {
  /** v1 / v2 / v3 */
  activeId: string;
  onActiveChange: (id: string) => void;
  /** Which item shows description + tags; `null` = all rows collapsed. */
  openId: string | null;
  onOpenChange: (id: string | null) => void;
  /** Copy keyed by active id. */
  explainers: Record<string, Explainer>;
  className?: string;
};

/**
 * Figma: Key-screens — vertical pivot (e.g. 176:54306, layout 176:54078). Floating
 * on the grid (no panel chrome); open state shows copy + tags, closed = title + faint bar.
 */
export function DirectionsExploredPivotRail({
  activeId,
  onActiveChange,
  openId,
  onOpenChange,
  explainers,
  className,
}: DirectionsExploredPivotRailProps) {
  const groupId = useId();

  const handleRowClick = (id: string) => {
    if (activeId === id && openId === id) {
      onOpenChange(null);
      return;
    }
    onActiveChange(id);
    onOpenChange(id);
  };

  return (
    <nav
      className={cn(
        "relative z-20 flex w-full max-w-[min(20rem,100%)] flex-col",
        "bg-transparent",
        "overflow-y-auto overflow-x-hidden",
        className
      )}
      aria-label="Directions sub-navigation"
    >
      <ul className="flex w-full min-w-0 flex-col gap-0 px-2.5 py-4 sm:px-3">
        {WORKFLOW_DIRECTION_ITERATIONS.map((item) => {
          const isOpen = openId === item.id;
          const isActive = activeId === item.id;
          const copy = explainers[item.id] ?? { title: item.title, body: "" };
          const panelId = `${groupId}-panel-${item.id}`;
          const bodyId = `${groupId}-body-${item.id}`;

          return (
            <li key={item.id} className="min-w-0">
              <div
                className="group flex w-full min-w-0 items-stretch gap-0 py-2 pr-0.5"
              >
                <div
                  className={cn(
                    "w-2 shrink-0 rounded-lg",
                    isOpen
                      ? "self-stretch bg-[#18174d]"
                      : "h-9 w-2 self-center bg-[rgba(24,23,77,0.2)]"
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1 pl-3">
                  <button
                    type="button"
                    id={panelId}
                    aria-expanded={isOpen}
                    aria-controls={bodyId}
                    onClick={() => handleRowClick(item.id)}
                    className="flex w-full min-w-0 items-start justify-between gap-1 rounded-md pr-0.5 text-left outline-none transition hover:bg-[#18174d]/[0.04] focus-visible:ring-2 focus-visible:ring-[#4f4bff]/35"
                  >
                    <div className="min-w-0 flex-1">
                      <h3
                        className={cn(
                          "font-workflow-chrome tracking-tight",
                          isOpen
                            ? "text-[17px] font-bold leading-tight text-[#18174d] sm:text-[18px]"
                            : isActive
                              ? "text-[17px] font-semibold leading-snug text-[#18174d] sm:text-[18px]"
                              : "text-[17px] font-medium leading-snug text-[#3d3b56] sm:text-[18px]"
                        )}
                      >
                        {copy.title}
                      </h3>
                    </div>
                    <span className="mt-0.5 shrink-0 self-start text-[#18174d]/45">
                      <ChevronRight
                        className={cn(
                          "size-4 transition-transform",
                          isOpen && "rotate-90"
                        )}
                        strokeWidth={2}
                        aria-hidden
                      />
                    </span>
                  </button>
                  {isOpen && copy.body ? (
                    <div
                      id={bodyId}
                      role="region"
                      aria-labelledby={panelId}
                      className="mt-2.5 w-full min-w-0 max-w-[19rem] space-y-3 border-t-0"
                    >
                      <p className="text-left text-[14px] font-workflow-chrome font-normal leading-relaxed text-[#18174d]">
                        {copy.body}
                      </p>
                      {copy.tags && copy.tags.length > 0 ? (
                        <ul
                          className="flex flex-wrap gap-1.5"
                          aria-label="Tradeoffs"
                        >
                          {copy.tags.map((tag, ti) => (
                            <li key={`${item.id}-pivot-tag-${ti}`}>
                              <span
                                className={cn(
                                  "inline-flex min-h-6 max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-left font-workflow-chrome text-[11px] font-medium leading-tight sm:text-[12px]",
                                  tag.kind === "pro"
                                    ? "bg-[#d1fae5] text-[#14532d] ring-1 ring-[#a7f3d0]/60"
                                    : "bg-[#ffe4e6] text-[#9f1239] ring-1 ring-[#fecdd3]/70"
                                )}
                                aria-label={
                                  tag.kind === "pro"
                                    ? `Advantage: ${tag.label}`
                                    : `Drawback: ${tag.label}`
                                }
                              >
                                <span
                                  className={cn(
                                    "size-1.5 shrink-0 rounded-full",
                                    tag.kind === "pro"
                                      ? "bg-[#059669]"
                                      : "bg-[#e11d48]"
                                  )}
                                  aria-hidden
                                />
                                <span className="min-w-0 break-words">
                                  {tag.label}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export const DIRECTIONS_PIVOT_RAIL_WIDTH = RAIL_WIDTH_PX;
