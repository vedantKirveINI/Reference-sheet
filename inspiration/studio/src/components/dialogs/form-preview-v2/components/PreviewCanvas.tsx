import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePreviewContext } from "../context";
import { DeviceFrame } from "./DeviceFrame";

interface PreviewCanvasProps {
  children: React.ReactNode;
}

export function PreviewCanvas({ children }: PreviewCanvasProps) {
  const { viewport } = usePreviewContext();

  useEffect(() => {
    console.log("[PREVIEW_DEBUG] PreviewCanvas viewport:", viewport);
  }, [viewport]);

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        "pt-[88px] pb-[100px]",
        "bg-[#f8f9fa]"
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />
      <DeviceFrame key={`device-frame-${viewport}`} viewport={viewport}>
        {children}
      </DeviceFrame>
    </div>
  );
}
