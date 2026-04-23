import { FinalDesignAppHeader } from "./FinalDesignAppHeader";
import { FinalDesignSideNav } from "./FinalDesignSideNav";
import {
  FinalDesignWorkflowEditorPanel,
  type WorkflowSaveStatus,
} from "./FinalDesignWorkflowEditorPanel";
import { FinalDesignWorkflowHeader } from "./FinalDesignWorkflowHeader";

export type FinalDesignLaptopScreenProps = {
  /** When true, workflow bar shows Version / Draft / save status + enabled publish (Figma 1:50251). */
  workflowEditing?: boolean;
  /** Only used when `workflowEditing` is true. */
  workflowSaveStatus?: WorkflowSaveStatus;
};

/**
 * Frame “Day 1” (Figma 1:15048): Product header full width; title block left edge aligns with
 * workflow column at 129px; tab navigation (1:20874) at x=34; extra margin below page title before
 * the workflow editor / canvas; gap after the 53px nav uses pl-[42px] so main column starts at 129px (matches title block).
 */
export function FinalDesignLaptopScreen({
  workflowEditing = false,
  workflowSaveStatus = "saved",
}: FinalDesignLaptopScreenProps) {
  return (
    <div
      className="flex h-full min-h-0 w-full flex-col overflow-y-auto overflow-x-hidden bg-[#F7F7F8] text-[#18174d] antialiased"
      role="document"
      aria-label="Final design screen"
      data-node-id="1:15048"
      data-name="Day 1"
    >
      <FinalDesignAppHeader />

      <div className="mt-[19px] shrink-0 pl-[max(1.5rem,129px)] pr-[max(1.5rem,5.5556%)]">
        <FinalDesignWorkflowHeader />
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-row items-start pb-5 sm:mt-[1.8rem]">
        <div className="ml-[34px] shrink-0">
          <FinalDesignSideNav />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col pl-[42px] pr-[max(1.5rem,5.5556%)] pt-2">
          <FinalDesignWorkflowEditorPanel
            className="min-h-0 flex-1"
            barState={workflowEditing ? "draft" : "day0"}
            saveStatus={workflowSaveStatus}
          />
        </div>
      </div>
    </div>
  );
}
