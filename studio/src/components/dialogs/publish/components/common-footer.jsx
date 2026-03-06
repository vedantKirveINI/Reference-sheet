import { Button } from "@/components/ui/button";
import { Check, Upload } from "lucide-react";
import { getFormattedDate } from "../../../../utils/utils";
import { getMode } from "../../../canvas/config";
import { CANVAS_MODES } from "../../../../module/constants";

const CommonFooter = ({
  onSave = () => {},
  onPublish = () => {},
  assetDetails = {},
}) => {
  const isPublished = !!assetDetails?.asset?.published_info?.published_at;
  const isWorkflowCanvas = getMode() === CANVAS_MODES.WORKFLOW_CANVAS;

  return (
    <div
      className="w-full min-w-full pt-2"
      data-testid="publish-footer-wrapper"
    >
      <div
        className="flex items-center justify-between w-full min-w-full px-5 py-4 bg-white border-t border-zinc-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
        data-testid="publish-footer"
      >
        <div className="flex items-center gap-2.5">
          {isPublished && (
            <>
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-sm font-medium text-zinc-700"
                  data-testid="publish-info-label"
                >
                  Last published on{" "}
                  {getFormattedDate(
                    assetDetails?.asset?.published_info?.published_at
                  )}
                </span>
                {isWorkflowCanvas && (
                  <span
                    className="text-xs text-zinc-500"
                    data-testid="publish-info-caption"
                  >
                    All new settings will be applied only after you republish
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        <Button
          onClick={onPublish}
          className="bg-[#1C3693] hover:bg-[#162b78] text-white gap-2 font-semibold rounded-xl px-5 py-2.5 shadow-[0_2px_8px_rgba(28,54,147,0.25)] hover:shadow-[0_4px_12px_rgba(28,54,147,0.35)] transition-all"
          data-testid="form-publish-save-button"
        >
          <Upload className="w-4 h-4" />
          Publish
        </Button>
      </div>
    </div>
  );
};

export default CommonFooter;
