import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { MessageCircle, X } from "lucide-react";

export const TroubleShootCard = ({ onContactUsClicked = () => {} }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  return null;

  if (isDismissed) {
    return (
      <div
        className="fixed bottom-6 left-6 z-[110]"
        data-testid="trouble-shoot-bubble-minimized"
      >
        <button
          onClick={onContactUsClicked}
          className={cn(
            "w-12 h-12 rounded-full shadow-lg",
            "bg-[#1C3693] hover:bg-[#152a75]",
            "flex items-center justify-center",
            "transition-all duration-300 ease-out",
            "hover:scale-105 hover:shadow-xl"
          )}
          data-testid="chat-bubble-button"
        >
          <MessageCircle className="w-5 h-5 text-white" />
        </button>
      </div>
    );
  }
  
  return (
    <div
      className="fixed bottom-6 left-6 z-[110]"
      data-testid="trouble-shoot-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "relative flex items-center",
          "bg-white rounded-full shadow-lg",
          "border border-gray-100",
          "transition-all duration-300 ease-out",
          "overflow-hidden cursor-pointer",
          isHovered ? "pr-4" : ""
        )}
        style={{
          width: isHovered ? "auto" : "52px",
          minWidth: isHovered ? "180px" : "52px",
        }}
        onClick={onContactUsClicked}
      >
        <div
          className={cn(
            "flex-shrink-0 w-[52px] h-[52px] rounded-full",
            "bg-[#1C3693] flex items-center justify-center",
            "transition-all duration-200",
            "hover:bg-[#152a75]"
          )}
        >
          <MessageCircle className="w-5 h-5 text-white" />
        </div>

        <div
          className={cn(
            "flex items-center gap-2 overflow-hidden",
            "transition-all duration-300",
            isHovered ? "opacity-100 ml-3" : "opacity-0 w-0 ml-0"
          )}
        >
          <span 
            className="text-sm font-medium text-gray-700 whitespace-nowrap"
            style={{ fontFamily: "Archivo, sans-serif" }}
          >
            Need help222?
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className={cn(
              "p-1 rounded-full",
              "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
              "transition-all duration-200"
            )}
            aria-label="Minimize help bubble"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
