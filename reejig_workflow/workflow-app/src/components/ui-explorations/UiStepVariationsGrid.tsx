import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Figma node 203-14449 — assets from Figma MCP `get_design_context` (7-day URL expiry).
 * Replace with local SVGs if these rotate out of date.
 */
const ASSET = {
  dragA:
    "https://www.figma.com/api/mcp/asset/34a1c5ed-2e34-4e1b-964c-8a8d07bd55ad",
  dragB:
    "https://www.figma.com/api/mcp/asset/848e8e7a-601e-4c29-904a-a300a7acf721",
  fileSearchLilac:
    "https://www.figma.com/api/mcp/asset/85283bbc-f66d-4653-9b33-127a9a7ca490",
  fileSearchGrey:
    "https://www.figma.com/api/mcp/asset/92ed2066-9408-4f22-a322-f1be2317d795",
  pencil:
    "https://www.figma.com/api/mcp/asset/494dd824-7e0b-4af0-b74c-72b42a4b2200",
} as const;

const DEMO_STEP_TITLE = "Conduct Hands-on Assessment";
const DEMO_STEP_BODY =
  "Analyze benchmark data and visualize comparative insights with summaries.";

/** Step card max width; grid tile background is narrowed separately. */
const CARD_W = "w-full max-w-[28rem]";

/** Figma: Paragraph/Regular + Semibold use Inter. */
const FIGMA_INTER = "font-['Inter',sans-serif]";

/** Step samples — final-design–style: slight lift, shadow, indigo focus (see FinalDesignWorkflowCanvas / flyouts). */
const STEP_HOVER_BASE =
  "group cursor-default select-none transition-[box-shadow,transform,border-color,background-color] duration-200 ease-out " +
  "hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(24,23,77,0.1)] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]/35";

const STEP_HOVER_NEUTRAL =
  "border-[#9595a6] bg-[#fcfcfe] shadow-[0_4px_12px_rgba(0,0,0,0.08)] " +
  "hover:border-[#a5a3ff] hover:bg-[#f6f4ff] hover:shadow-[0_10px_26px_rgba(79,75,255,0.1)]";

const STEP_HOVER_INDIGO =
  "shadow-[0_4px_12px_rgba(0,0,0,0.08)] " +
  "hover:shadow-[0_12px_30px_rgba(79,75,255,0.2)] " +
  "hover:ring-1 hover:ring-[#4f4bff]/30";

/** Figma: rgba(79,75,255,0.14) — pill widths 137 / 77 / 87, h-25, rounded-14.5 */
function TagRowIndigoAlpha() {
  return (
    <div
      className="flex w-full flex-wrap gap-2.5"
      aria-hidden
    >
      <span
        className="h-[25px] w-[137px] max-w-full shrink-0 rounded-[14.5px] bg-[rgba(79,75,255,0.14)]"
      />
      <span
        className="h-[25px] w-[77px] max-w-full shrink-0 rounded-[14.5px] bg-[rgba(79,75,255,0.14)]"
      />
      <span
        className="h-[25px] w-[87px] max-w-full shrink-0 rounded-[14.5px] bg-[rgba(79,75,255,0.14)]"
      />
    </div>
  );
}

function TagRowE6() {
  return (
    <div
      className="flex w-full gap-[10.7px] text-[0]"
      aria-hidden
    >
      <span className="h-[26.87px] min-h-0 flex-1 rounded-[15.6px] bg-[#e6e6ff]" />
      <span className="h-[26.87px] min-h-0 flex-1 rounded-[15.6px] bg-[#e6e6ff]" />
      <span className="h-[26.87px] min-h-0 flex-1 rounded-[15.6px] bg-[#e6e6ff]" />
    </div>
  );
}

function WindowControls() {
  return (
    <div
      className="flex w-[5.4rem] shrink-0 items-start gap-2.5"
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-[22px] min-w-0 flex-1 rounded-full bg-[#d9d9e4]"
        />
      ))}
    </div>
  );
}

function HeaderWithChip() {
  return (
    <div className="flex h-[53px] min-h-[53px] w-full items-center border border-[#4f4bff] border-b-0 bg-[#f4f4fa] px-[19px] py-3 transition-colors duration-200 group-hover:border-[#3d36c9] group-hover:bg-[#eceefe] sm:rounded-t-2xl">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-[4px] bg-[#4f4bff] transition-colors duration-200 group-hover:bg-[#3d36b8]">
          <span className="text-[13px] font-semibold leading-none text-white">
            01
          </span>
        </div>
        <p className="min-w-0 text-[16px] font-semibold leading-[1.2] text-[#18174d]">
          {DEMO_STEP_TITLE}
        </p>
      </div>
    </div>
  );
}

/** 1 — With step number highlighted (Figma: rounded pill “O1”, 24px, #4f4bff) */
function WithStepNumberHighlighted() {
  return (
    <div
      className={cn(
        CARD_W,
        FIGMA_INTER,
        "flex flex-col gap-[15px] rounded-[14px] border px-4 py-5 text-left",
        STEP_HOVER_BASE,
        STEP_HOVER_NEUTRAL
      )}
    >
      <div className="flex w-full items-center gap-[21px]">
        <div className="flex h-[67px] w-[68px] shrink-0 items-center justify-center rounded-[33.5px] border border-[#4f4bff] bg-[#ededfe] transition-[border-color,background-color] duration-200 group-hover:border-[#3d36c9] group-hover:bg-[#e0ddff]">
          <span className="whitespace-nowrap text-2xl font-semibold leading-none text-[#4f4bff]">
            O1
          </span>
        </div>
        <div className="flex min-w-0 max-w-[20.5rem] flex-col gap-2.5 text-[16px] leading-[1.2]">
          <p className="w-full font-semibold text-[#18174d]">{DEMO_STEP_TITLE}</p>
          <p className="w-full font-normal text-[#494959]">{DEMO_STEP_BODY}</p>
        </div>
      </div>
      <TagRowIndigoAlpha />
    </div>
  );
}

/** 2 — With icons highlighted (8px square icon well + single title line) */
function WithIconsHighlighted() {
  return (
    <div
      className={cn(
        CARD_W,
        FIGMA_INTER,
        "flex flex-col gap-[15px] rounded-[14px] border px-4 py-5 text-left",
        STEP_HOVER_BASE,
        STEP_HOVER_NEUTRAL
      )}
    >
      <div className="flex w-full items-center gap-[21px]">
        <div className="flex h-[67px] w-[68px] shrink-0 items-center justify-center rounded-lg border border-[#4f4bff] bg-[#ededfe] p-4 transition-[border-color,background-color] duration-200 group-hover:border-[#3d36c9] group-hover:bg-[#e0ddff]">
          <img
            src={ASSET.pencil}
            alt=""
            className="size-8 max-h-none max-w-none object-contain"
          />
        </div>
        <div className="flex min-w-0 max-w-[20.5rem] flex-col gap-2.5 text-[16px] leading-[1.2]">
          <p className="w-full font-semibold text-[#18174d]">
            01 {DEMO_STEP_TITLE}
          </p>
          <p className="w-full font-normal text-[#494959]">{DEMO_STEP_BODY}</p>
        </div>
      </div>
      <TagRowIndigoAlpha />
    </div>
  );
}

/** 3 — Prominent step header: chip header + body copy #808094 + #e6e6ff tags */
function ProminentStepHeader() {
  return (
    <div
      className={cn(
        CARD_W,
        FIGMA_INTER,
        "overflow-hidden rounded-2xl border border-[#4f4bff] text-left",
        STEP_HOVER_BASE,
        STEP_HOVER_INDIGO
      )}
    >
      <HeaderWithChip />
      <div className="flex min-h-0 flex-col gap-2.5 border border-t-0 border-[#4f4bff] bg-white px-[19px] py-5 transition-colors duration-200 group-hover:border-[#3d36c9] group-hover:bg-[#faf9ff] sm:rounded-b-2xl">
        <p className="w-full max-w-[20.5rem] text-[16px] font-normal leading-[1.2] text-[#808094]">
          {DEMO_STEP_BODY}
        </p>
        <TagRowE6 />
      </div>
    </div>
  );
}

/** 4 — Prominent step header + icon: no tags; body = circle + description only */
function ProminentStepHeaderWithIcon() {
  return (
    <div
      className={cn(
        CARD_W,
        FIGMA_INTER,
        "overflow-hidden rounded-2xl border border-[#4f4bff] text-left",
        STEP_HOVER_BASE,
        STEP_HOVER_INDIGO
      )}
    >
      <HeaderWithChip />
      <div className="h-[115px] min-h-[7rem] border border-t-0 border-[#4f4bff] bg-white px-[19px] py-5 transition-colors duration-200 group-hover:border-[#3d36c9] group-hover:bg-[#faf9ff] sm:rounded-b-2xl sm:min-h-[7.2rem]">
        <div className="flex items-center gap-2.5 sm:gap-2.5">
          <div className="flex h-[74px] w-[75px] shrink-0 items-center justify-center rounded-full border border-[#4f4bff] bg-[#ededfe] p-[11px] transition-[border-color,background-color] duration-200 group-hover:border-[#3d36c9] group-hover:bg-[#e0ddff]">
            <img
              src={ASSET.fileSearchLilac}
              alt=""
              className="size-[30px] object-contain"
            />
          </div>
          <p className="min-w-0 max-w-[20.5rem] flex-1 text-[16px] font-normal leading-[1.2] text-[#494959]">
            {DEMO_STEP_BODY}
          </p>
        </div>
      </div>
    </div>
  );
}

function GreyChromeHeader() {
  return (
    <div
      className={cn(
        "flex h-[53px] min-h-[53px] w-full items-center gap-2.5 border border-[#9190a4] border-b-0 bg-[#f4f4fa] px-[19px] py-3 sm:rounded-t-2xl",
        "transition-[background-color,border-color,box-shadow] duration-200",
        "group-hover:border-[#c4c2db] group-hover:bg-[#f8f7fd]",
        "group-hover:shadow-[inset_0_-1px_0_0_rgba(79,75,255,0.12)]"
      )}
    >
      <div className="w-[29px] shrink-0 transition-transform duration-200 group-hover:scale-[0.98] group-hover:opacity-90">
        <img
          src={ASSET.dragB}
          alt=""
          className="h-[29px] w-[29px] object-contain"
        />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <p className="shrink-0 text-[16px] font-semibold leading-[1.2] text-[#18174d] transition-colors duration-200 group-hover:text-[#14133f]">
          Step 01
        </p>
        <div className="transition-opacity duration-200 group-hover:opacity-80">
          <WindowControls />
        </div>
      </div>
    </div>
  );
}

function LilacChromeHeader() {
  return (
    <div className="flex h-[53px] min-h-[53px] w-full items-center gap-2.5 border border-[#9190a4] border-b-0 bg-[#9e9cd3] px-[19px] py-3 transition-colors duration-200 sm:rounded-t-2xl group-hover:bg-[#8f8cc5] group-hover:border-[#7a78a0]">
      <div className="w-[29px] shrink-0">
        <img
          src={ASSET.dragA}
          alt=""
          className="h-[29px] w-[29px] object-contain"
        />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <p className="shrink-0 text-[16px] font-semibold leading-[1.2] text-white">
          Step 01
        </p>
        <WindowControls />
      </div>
    </div>
  );
}

/** 5 — GREY: glass body, circle border #808094, no tags in file */
function ProminentStepHeaderIconGrey() {
  return (
    <div
      className={cn(
        CARD_W,
        FIGMA_INTER,
        "overflow-hidden rounded-2xl text-left shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
        STEP_HOVER_BASE,
        "group-hover:shadow-[0_12px_32px_rgba(79,75,255,0.1)]"
      )}
    >
      <GreyChromeHeader />
      <div
        className={cn(
          "min-h-0 border border-[#9190a4] bg-[rgba(255,255,255,0.71)] px-[19px] py-5 sm:rounded-b-2xl",
          "transition-[background-color,border-color,box-shadow] duration-200",
          "group-hover:border-[#c4c2d8] group-hover:bg-white/92",
          "group-hover:shadow-[inset_0_0_0_1px_rgba(79,75,255,0.1)]"
        )}
      >
        <div className="flex items-center gap-[21px]">
          <div
            className={cn(
              "flex h-[67px] w-[68px] shrink-0 items-center justify-center rounded-[33.5px] border border-[#808094] bg-[#f4f4fa] px-4 py-[21px]",
              "transition-[border-color,background-color,box-shadow] duration-200",
              "group-hover:border-[#4f4bff]/45",
              "group-hover:bg-[#f3f1ff] group-hover:shadow-[0_3px_12px_rgba(79,75,255,0.15)]"
            )}
          >
            <img
              src={ASSET.fileSearchGrey}
              alt=""
              className="size-[30px] object-contain"
            />
          </div>
          <div className="flex min-w-0 max-w-[20.5rem] flex-col gap-2.5 text-[16px] leading-[1.2]">
            <p className="w-full font-semibold text-[#18174d]">{DEMO_STEP_TITLE}</p>
            <p className="w-full font-normal text-[#494959]">{DEMO_STEP_BODY}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 6 — LILAC: white “Step 01” on #9e9cd3, body + indigo alpha tags */
function ProminentStepHeaderIconLilac() {
  return (
    <div
      className={cn(
        CARD_W,
        FIGMA_INTER,
        "overflow-hidden rounded-2xl text-left shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
        STEP_HOVER_BASE
      )}
    >
      <LilacChromeHeader />
      <div className="min-h-0 border border-[#9190a4] bg-white px-[19px] py-5 transition-colors duration-200 sm:rounded-b-2xl group-hover:border-[#7e7c92] group-hover:bg-[#faf9ff]">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-[21px]">
            <div className="flex h-[67px] w-[68px] shrink-0 items-center justify-center rounded-[33.5px] border border-[#4f4bff] bg-[#ededfe] px-4 py-[21px] transition-[border-color,background-color] duration-200 group-hover:border-[#3d36c9] group-hover:bg-[#e0ddff]">
              <img
                src={ASSET.fileSearchLilac}
                alt=""
                className="size-[30px] object-contain"
              />
            </div>
            <div className="flex min-w-0 max-w-[20.5rem] flex-col gap-2.5 text-[16px] leading-[1.2]">
              <p className="w-full font-semibold text-[#18174d]">
                {DEMO_STEP_TITLE}
              </p>
              <p className="w-full font-normal text-[#494959]">{DEMO_STEP_BODY}</p>
            </div>
          </div>
          <TagRowIndigoAlpha />
        </div>
      </div>
    </div>
  );
}

/** Figma layout: 14583/14586 row0, 14688/14687 row1, 14717/14716 row2 (checkerboard). */
/** More lilac cells: #c2c2eb at 65% opacity; lighter cells unchanged. */
const PANEL_LILAC_65 = "bg-[rgba(194,194,235,0.65)]";

function panelClassForIndex(i: number) {
  const col = i % 2;
  const row = Math.floor(i / 2);
  if (row === 0) {
    return col === 0
      ? PANEL_LILAC_65
      : "bg-[rgba(200,200,224,0.65)]";
  }
  if (row === 1) {
    return col === 0
      ? "bg-[rgba(200,200,224,0.65)]"
      : PANEL_LILAC_65;
  }
  return col === 0
    ? PANEL_LILAC_65
    : "bg-[rgba(200,200,224,0.65)]";
}

const GRID: {
  id: string;
  label: string;
  variant:
    | "num"
    | "icon"
    | "head"
    | "headIcon"
    | "grey"
    | "lilac";
}[] = [
  { id: "1", label: "With step number highlighted", variant: "num" },
  { id: "2", label: "With icons highlighted", variant: "icon" },
  { id: "3", label: "Prominent step header", variant: "head" },
  { id: "4", label: "Prominent step header + icon", variant: "headIcon" },
  { id: "5", label: "Prominent step header + icon - GREY", variant: "grey" },
  { id: "6", label: "Prominent step header + icon LILAC", variant: "lilac" },
];

function renderVariant(
  v: (typeof GRID)[number]["variant"]
): ReactNode {
  switch (v) {
    case "num":
      return <WithStepNumberHighlighted />;
    case "icon":
      return <WithIconsHighlighted />;
    case "head":
      return <ProminentStepHeader />;
    case "headIcon":
      return <ProminentStepHeaderWithIcon />;
    case "grey":
      return <ProminentStepHeaderIconGrey />;
    case "lilac":
      return <ProminentStepHeaderIconLilac />;
    default:
      return null;
  }
}

/**
 * 2×3: whole grid 90% width (10% page inset); nudged 65px left. Cells fill tracks; `gap-8` (32px).
 */
export function UiStepVariationsGrid() {
  return (
    <div className="w-full min-w-0 -translate-x-[65px]">
      <div
        className="mx-auto grid w-[90%] max-w-full min-w-0 auto-rows-min grid-cols-1 gap-8 md:grid-cols-2"
        role="list"
        aria-label="Step UI variation samples"
      >
        {GRID.map((cell, i) => (
          <div
            key={cell.id}
            className={cn(
              "flex w-full min-w-0 min-h-0 flex-col gap-3 rounded-2xl p-6 sm:min-h-[16rem] sm:gap-4 sm:p-7 md:min-h-[19rem] lg:min-h-[22rem]",
              panelClassForIndex(i)
            )}
            role="listitem"
          >
            <p className="max-w-prose text-left text-[15px] font-workflow-chrome font-medium leading-relaxed text-[#494959]">
              {cell.label}
            </p>
            <div className="flex min-h-0 w-full flex-1 items-center justify-center">
              <div className="w-full max-w-[28rem] origin-center scale-80 will-change-transform">
                {renderVariant(cell.variant)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
