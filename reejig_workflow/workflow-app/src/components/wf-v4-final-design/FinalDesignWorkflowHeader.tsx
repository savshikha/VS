import { ChevronDown } from "lucide-react";
import { WF_FIGMA } from "./mcpFigmaIconUrls";

/**
 * Title block below Product Header (Figma 1:20882).
 * Icons use natural img sizing (no overflow-hidden / no fixed 24px row height) so nothing clips.
 */
export function FinalDesignWorkflowHeader() {
  return (
    <header
      className="flex w-full shrink-0 flex-col gap-4 bg-transparent font-[Inter,sans-serif]"
      data-name="Title"
      data-node-id="1:20882"
    >
      <div className="flex w-full min-w-0 items-center justify-between gap-4 p-0">
        <div className="flex min-h-px min-w-0 flex-1 items-center gap-2">
          <div className="flex shrink-0 items-center justify-center rounded-[11.538px] bg-[#9d4edd] p-[7.692px]">
            <img
              alt=""
              className="size-[34.615px] shrink-0 object-contain"
              src={WF_FIGMA.titleJob}
              width={35}
              height={35}
              decoding="async"
            />
          </div>
          <div className="flex min-w-0 shrink flex-col justify-center leading-[0] not-italic">
            <p className="text-[36px] leading-none font-bold whitespace-normal text-[#18174d]">
              Workflow Re-invention Studio
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start">
            <div className="flex shrink-0 items-center justify-center gap-0 rounded-full bg-gradient-to-r from-[#4f4bff] to-[#9747ff] px-2 py-0.5">
              <p className="text-center text-[14px] leading-[1.2] font-semibold whitespace-nowrap text-white not-italic">
                Preview
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <div className="flex h-10 shrink-0 items-center gap-2">
            <div className="flex shrink-0 flex-col justify-center leading-[0] whitespace-nowrap not-italic">
              <p className="text-[16px] leading-[1.2] font-medium text-[#494959]">
                Roadmap status
              </p>
            </div>
            <button
              type="button"
              className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-solid border-[#dfdfe4] bg-white px-3 py-2"
              aria-haspopup="listbox"
              aria-label="Roadmap status, None"
            >
              <span className="flex shrink-0 items-center justify-center gap-2 rounded-[100px] bg-white px-2 py-0.5">
                <img
                  alt=""
                  className="size-1.5 shrink-0 object-contain"
                  src={WF_FIGMA.titleStatusDot}
                  width={6}
                  height={6}
                  decoding="async"
                />
                <span className="text-center text-[14px] leading-[1.2] font-semibold whitespace-nowrap text-[#808094] not-italic">
                  None
                </span>
                <ChevronDown
                  className="size-4 shrink-0 text-[#808094]"
                  strokeWidth={2}
                  aria-hidden
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        className="flex w-full min-w-0 flex-wrap items-center gap-2 py-0.5"
        data-name="Title + role"
      >
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 bg-transparent"
        >
          <img
            alt=""
            className="size-6 shrink-0 object-contain"
            src={WF_FIGMA.titleUsers}
            width={24}
            height={24}
            decoding="async"
            aria-hidden
          />
          <span className="text-left text-[18px] leading-snug font-bold whitespace-nowrap text-[#18174d] not-italic">
            AI Business Analyst
          </span>
        </button>
        <img
          alt=""
          className="size-6 shrink-0 object-contain"
          src={WF_FIGMA.titleArrow}
          width={24}
          height={24}
          decoding="async"
          aria-hidden
        />
        <button
          type="button"
          className="flex min-w-0 cursor-pointer items-center gap-2 bg-transparent text-left"
        >
          <img
            alt=""
            className="size-6 shrink-0 object-contain"
            src={WF_FIGMA.titleTasks}
            width={24}
            height={24}
            decoding="async"
            aria-hidden
          />
          <span className="min-w-0 text-[18px] leading-snug font-bold text-[#18174d] not-italic">
            Evaluate AI technologies and tools for implementation
          </span>
        </button>
      </div>
    </header>
  );
}
