import { WF_FIGMA } from "./mcpFigmaIconUrls";

/**
 * Product header — full width inside the laptop viewport (Figma 1:15049).
 */
export function FinalDesignAppHeader() {
  return (
    <header
      className="flex min-h-[88px] w-full shrink-0 items-center justify-between gap-4 bg-transparent px-6 py-0 font-[Inter,sans-serif]"
      data-name="Product Header"
      data-node-id="1:15049"
    >
      <div
        className="flex min-h-px min-w-px flex-1 items-center gap-6"
        data-name="Left Col"
      >
        <div
          className="relative h-[44px] w-[43.35px] shrink-0"
          data-name="Logo"
        >
          <img
            alt=""
            className="pointer-events-none absolute block size-full max-w-none"
            src={WF_FIGMA.headerLogo}
            width={44}
            height={44}
            decoding="async"
          />
        </div>
        <div className="flex shrink-0 flex-col justify-center leading-[0] whitespace-nowrap not-italic">
          <p className="text-[16px] leading-[1.2] font-semibold text-[#18174d]">
            Work OS
          </p>
        </div>
      </div>

      <div
        className="flex shrink-0 items-center gap-2 rounded-[12px] border border-solid border-[#dadae1] bg-white px-3 py-[14px]"
        data-name="Search"
      >
        <div className="relative size-4 shrink-0 overflow-hidden" aria-hidden>
          <img
            alt=""
            className="pointer-events-none absolute inset-[4.17%] block size-full max-w-none"
            src={WF_FIGMA.headerSearch}
            width={16}
            height={16}
            decoding="async"
          />
        </div>
        <label className="sr-only" htmlFor="final-design-header-search">
          Search
        </label>
        <input
          id="final-design-header-search"
          type="search"
          placeholder="Search for anything"
          className="w-[262px] shrink-0 border-0 bg-transparent p-0 text-[14px] leading-[18px] font-normal text-[#18174d] placeholder:text-[#6a6a7b] outline-none"
        />
      </div>

      <div
        className="flex shrink-0 items-center justify-end gap-4"
        data-name="Right Col"
      >
        <button
          type="button"
          className="flex size-12 shrink-0 items-center justify-center rounded-full border border-solid border-[#dfdfe4] bg-white"
          data-name="Header / Menu items"
          aria-label="Settings"
        >
          <div className="relative size-6 shrink-0 overflow-hidden" aria-hidden>
            <img
              alt=""
              className="pointer-events-none absolute block size-full max-w-none"
              src={WF_FIGMA.headerGear}
              width={24}
              height={24}
              decoding="async"
            />
          </div>
        </button>
        <div className="relative size-12 shrink-0" data-name="Avatar">
          <div className="absolute top-0 left-0 size-12 overflow-hidden rounded-full">
            <img
              alt=""
              className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
              src={WF_FIGMA.headerAvatar}
              width={48}
              height={48}
              decoding="async"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
