import React from "react";
import { cn } from "@/lib/utils";

const ODSCircularProgress = ({ 
  size = 40,
  thickness = 3.6,
  value,
  className,
  ...props 
}) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = value !== undefined 
    ? circumference - (value / 100) * circumference 
    : undefined;

  return (
    <div
      className={cn("inline-flex items-center justify-center", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      {...props}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          className="opacity-25"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            value !== undefined ? "transition-all duration-300" : "animate-spin",
            value === undefined && "stroke-dasharray-[1,200]"
          )}
          style={
            value === undefined
              ? {
                  strokeDasharray: `${circumference * 0.25} ${circumference}`,
                  strokeDashoffset: 0,
                  animation: "spin 1.4s linear infinite",
                }
              : {}
          }
        />
      </svg>
    </div>
  );
};

export default ODSCircularProgress;
