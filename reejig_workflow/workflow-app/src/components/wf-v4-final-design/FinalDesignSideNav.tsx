import { cn } from "@/lib/utils";
import { WF_FIGMA } from "./mcpFigmaIconUrls";

const NAV_ICONS = [
  { id: "spark", src: WF_FIGMA.navSpark, label: "Input spark" },
  { id: "pathways", src: WF_FIGMA.navPathways, label: "Pathways" },
  { id: "compass", src: WF_FIGMA.navCompass, label: "Work ontology" },
  { id: "tasks", src: WF_FIGMA.navTasks, label: "Tasks" },
  { id: "stars", src: WF_FIGMA.navStars, label: "AI registry" },
] as const;

/**
 * Vertical pill tab navigation — Figma 1:20874 (53×281 in Day 1 frame, x=34).
 */
export function FinalDesignSideNav() {
  return (
    <nav
      className="flex w-[53px] shrink-0 flex-col items-center gap-3 rounded-[100px] bg-white p-1 shadow-[0px_4px_4px_rgba(24,23,77,0.05)]"
      aria-label="Workspace navigation"
      data-name="Tab navigation"
      data-node-id="1:20874"
    >
      {NAV_ICONS.map((item, index) => {
        const active = index === 1;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            aria-current={active ? "true" : undefined}
            className={cn(
              "flex size-[45px] shrink-0 items-center justify-center rounded-[120px] p-0 transition-[box-shadow,transform] hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]/40",
              active
                ? "bg-gradient-to-b from-[#4e4afe] to-[#0501b3] shadow-sm"
                : "bg-white"
            )}
          >
            <img
              alt=""
              src={item.src}
              width={24}
              height={24}
              className={cn(
                "size-6 object-contain",
                active ? "brightness-0 invert" : ""
              )}
              decoding="async"
            />
          </button>
        );
      })}
    </nav>
  );
}
