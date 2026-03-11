import React from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const InfoTooltip = ({ content }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-shrink-0 items-center justify-center cursor-pointer rounded p-0.5 hover:bg-gray-100">
            <Info className="w-4 h-4 text-gray-400" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-gray-800/90 text-white text-xs max-w-[16rem] p-2 rounded-md"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InfoTooltip;
