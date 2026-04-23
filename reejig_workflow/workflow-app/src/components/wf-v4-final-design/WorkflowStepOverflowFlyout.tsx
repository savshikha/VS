import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FLYOUT_Z = 10_050;
const MENU_WIDTH = 175;

export type StepOverflowFlyoutVariant = "noSuggestion" | "withSuggestion";

type StepOverflowFlyoutProps = {
  variant: StepOverflowFlyoutVariant;
  onAddAgent?: () => void;
  onDelete?: () => void;
};

/**
 * Figma Key screens 1:9218 — flyout from ⋯: “Add an agent” + “Delete”, or “Delete” only with suggestion row.
 */
export function StepOverflowFlyout({
  variant,
  onAddAgent,
  onDelete,
}: StepOverflowFlyoutProps) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const t = triggerRef.current;
    const fly = flyoutRef.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    const pad = 16;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const gap = 4;
    // Menu opens to the **right** of the ⋯ trigger (leading edge = trigger right + gap).
    let left = r.right + gap;
    if (left + MENU_WIDTH > vw - pad) {
      left = Math.max(pad, vw - pad - MENU_WIDTH);
    }
    const h =
      fly?.getBoundingClientRect().height ??
      (variant === "withSuggestion" ? 46 : 81);
    let top = r.top;
    if (top + h > vh - pad) {
      top = Math.max(pad, vh - pad - h);
    }
    setPos({ top, left });
  }, [variant]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const raf = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const n = e.target as Node;
      if (triggerRef.current?.contains(n)) return;
      if (flyoutRef.current?.contains(n)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = flyoutRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updatePosition());
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, updatePosition]);

  const showAddAgent = variant === "noSuggestion";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          setOpen((o) => !o);
        }}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg text-[#18174d] hover:bg-black/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]/35",
          open && "bg-black/[0.06]"
        )}
        aria-label="Step options"
      >
        <MoreHorizontal className="size-5" strokeWidth={2} />
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={flyoutRef}
              id={menuId}
              data-workflow-step-overflow-panel
              role="menu"
              className="fixed w-[175px] rounded-xl bg-white p-2 shadow-[0px_16px_24px_0px_rgba(0,0,0,0.16)]"
              style={{ top: pos.top, left: pos.left, zIndex: FLYOUT_Z }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-1">
                {showAddAgent && (
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[14px] font-semibold leading-[18px] text-[#18174d] transition-colors hover:bg-[#f4f4fa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]/35"
                    onClick={() => {
                      onAddAgent?.();
                      setOpen(false);
                    }}
                  >
                    <Plus className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                    Add an agent
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[14px] font-semibold leading-[18px] text-[#18174d] transition-colors hover:bg-[#f4f4fa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4bff]/35"
                  onClick={() => {
                    onDelete?.();
                    setOpen(false);
                  }}
                >
                  <Trash2 className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                  Delete
                </button>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
