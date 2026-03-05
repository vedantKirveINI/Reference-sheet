/**
 * @deprecated This component is deprecated and will be removed in a future release.
 * Use ResponsePill component instead, which provides a consolidated split-button
 * pattern with response count, today count badge, and analytics dropdown.
 * 
 * Migration: Replace FormResponseCTA with ResponsePill in your component:
 * ```jsx
 * <ResponsePill
 *   responseCount={metrics?.responses ?? 0}
 *   todayCount={metrics?.today ?? 0}
 *   assetId={assetId}
 *   assetDetails={assetDetails}
 * />
 * ```
 * 
 * @see ResponsePill - The replacement component
 */
import React, { useState, useCallback } from "react";
import { ChevronDown, Check, BarChart3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { REDIRECT_PATHS } from "../../../pages/ic-canvas/constants/constants";
import { getSheetURL } from "../../dialogs/publish/forms/utils";

const WC_LANDING_URL = import.meta.env.VITE_WC_LANDING_URL || process.env.REACT_APP_WC_LANDING_URL || "";

/**
 * @deprecated Use ResponsePill instead
 */
const FormResponseCTA = ({
  assetId = "",
  assetDetails = {},
  disabled = false,
}) => {
  const [selectedOption, setSelectedOption] = useState("responses");

  const onViewResponses = useCallback(() => {
    const targetUrl = getSheetURL({ assetDetails });
    if (targetUrl) {
      window.open(targetUrl, "_blank");
    }
  }, [assetDetails]);

  const onAnalytics = useCallback(() => {
    const id = assetDetails?.asset?._id || assetDetails?.asset?.asset_id || assetId;
    if (id) {
      const targetUrl = `${WC_LANDING_URL}/redirect?r=${REDIRECT_PATHS.ANALYTICS}&i=${id}`;
      window.open(targetUrl, "_blank");
    }
  }, [assetDetails?.asset?._id, assetDetails?.asset?.asset_id, assetId]);

  const handleMainButtonClick = useCallback(() => {
    if (disabled) return;
    if (selectedOption === "responses") {
      onViewResponses();
    } else if (selectedOption === "analytics") {
      onAnalytics();
    }
  }, [disabled, selectedOption, onViewResponses, onAnalytics]);

  const handleOptionSelect = useCallback((option, action) => {
    setSelectedOption(option);
    action();
  }, []);

  const buttonLabel = selectedOption === "responses" ? "Responses" : "Analytics";

  return (
    <div className="inline-flex" data-testid="form-response-cta">
      <Button
        variant="outline"
        size="default"
        disabled={disabled}
        onClick={handleMainButtonClick}
        className={cn(
          "rounded-r-none border-r-0",
          disabled && "opacity-60"
        )}
        data-testid="form-response-cta-main"
      >
        {selectedOption === "responses" ? (
          <FileText className="w-4 h-4 mr-2" />
        ) : (
          <BarChart3 className="w-4 h-4 mr-2" />
        )}
        {buttonLabel}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="default"
            disabled={disabled}
            className={cn(
              "rounded-l-none px-2 min-w-0",
              disabled && "opacity-60"
            )}
            data-testid="form-response-cta-dropdown"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => handleOptionSelect("responses", onViewResponses)}
            className="flex items-center gap-2"
          >
            {selectedOption === "responses" && <Check className="w-4 h-4" />}
            {selectedOption !== "responses" && <span className="w-4" />}
            <FileText className="w-4 h-4" />
            <span>Responses</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleOptionSelect("analytics", onAnalytics)}
            className="flex items-center gap-2"
          >
            {selectedOption === "analytics" && <Check className="w-4 h-4" />}
            {selectedOption !== "analytics" && <span className="w-4" />}
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FormResponseCTA;
