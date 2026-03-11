import React, { useCallback } from "react";
import { ChevronDown, BarChart3, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { REDIRECT_PATHS } from "../../../pages/ic-canvas/constants/constants";
import { getSheetURL } from "../../dialogs/publish/forms/utils";

const WC_LANDING_URL = import.meta.env.VITE_WC_LANDING_URL || process.env.REACT_APP_WC_LANDING_URL || "";

const ResponsePill = ({
  responseCount = 0,
  todayCount = 0,
  assetId = "",
  assetDetails = {},
  disabled = false,
  className,
}) => {
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

  const formattedCount = responseCount >= 1000 
    ? `${(responseCount / 1000).toFixed(1)}k`
    : responseCount.toLocaleString();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full",
        "bg-white border border-gray-200",
        "shadow-sm hover:shadow-md transition-shadow",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
      style={{ fontFamily: "Archivo, sans-serif" }}
      data-testid="response-pill"
    >
      <button
        type="button"
        onClick={onViewResponses}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-l-full",
          "hover:bg-gray-50 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[#1C3693]/20 focus:ring-inset"
        )}
        data-testid="response-pill-main"
      >
        <span 
          className="size-2 rounded-full bg-emerald-500 animate-pulse"
          aria-hidden="true"
        />
        <span className="font-semibold text-gray-900 tabular-nums">
          {formattedCount}
        </span>
        <span className="text-gray-600">Responses</span>
        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
      </button>

      <div className="w-px h-6 bg-gray-200" aria-hidden="true" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex items-center justify-center px-3 py-2 rounded-r-full",
              "hover:bg-gray-50 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-[#1C3693]/20 focus:ring-inset"
            )}
            data-testid="response-pill-dropdown"
          >
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {todayCount > 0 && (
            <>
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-sm text-gray-500">Today</span>
                <Badge 
                  variant="secondary" 
                  className="bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  +{todayCount}
                </Badge>
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={onViewResponses}
            className="flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-gray-500" />
            <span>View Responses</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onAnalytics}
            className="flex items-center gap-2 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <span>Analytics</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ResponsePill;
