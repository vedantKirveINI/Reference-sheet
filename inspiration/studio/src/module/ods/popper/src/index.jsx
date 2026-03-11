import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { computePosition, flip, shift, offset, autoUpdate } from "@floating-ui/dom";
import { cn } from "@/lib/utils";

/**
 * ODSPopper - Positioning utility using @floating-ui/dom
 * 
 * Prop Mapping:
 * - anchorEl: HTMLElement → Reference element to anchor to
 * - open: boolean → Whether the popper is visible
 * - placement: string → Floating-ui placement (top, bottom, left, right + start/end)
 * - offset: number → Distance from anchor element (default: 4) - LEGACY, kept for backward compatibility
 * - offsetDistance: number → Distance from anchor element (default: 4) - new preferred name
 * - disablePortal: boolean → Render inline instead of portal (default: false)
 * - container: HTMLElement → Portal target (default: document.body)
 * 
 * Features:
 * - Auto-flipping when near viewport edges
 * - Shift to stay within viewport
 * - Auto-updates on scroll/resize
 * 
 * Backward Compatibility:
 * - Both `offset` and `offsetDistance` props are supported
 * - `offset` takes precedence if both are provided (for legacy call-sites)
 */
const ODSPopper = ({ 
  anchorEl, 
  open, 
  placement = "bottom-start",
  children,
  className,
  style,
  offset: legacyOffset,
  offsetDistance: newOffsetDistance,
  disablePortal = false,
  container,
  ...props 
}) => {
  // Backward compatibility: accept both `offset` (legacy) and `offsetDistance` (new)
  const offsetValue = legacyOffset ?? newOffsetDistance ?? 4;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // Track whether position has been calculated - prevents flicker on open
  const [isPositioned, setIsPositioned] = useState(false);
  const popperRef = useRef(null);
  const cleanupRef = useRef(null);

  // Reset isPositioned when popper closes
  useLayoutEffect(() => {
    if (!open) {
      setIsPositioned(false);
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !anchorEl || !popperRef.current) return;

    // Convert ODS placement to floating-ui placement
    const placementMap = {
      "top-start": "top-start",
      "top": "top",
      "top-end": "top-end",
      "bottom-start": "bottom-start",
      "bottom": "bottom",
      "bottom-end": "bottom-end",
      "left-start": "left-start",
      "left": "left",
      "left-end": "left-end",
      "right-start": "right-start",
      "right": "right",
      "right-end": "right-end",
    };

    const floatingPlacement = placementMap[placement] || "bottom-start";

    const updatePosition = async () => {
      if (!anchorEl || !popperRef.current) return;

      const { x, y } = await computePosition(anchorEl, popperRef.current, {
        placement: floatingPlacement,
        middleware: [
          offset(offsetValue),
          flip({ fallbackAxisSideDirection: "end" }),
          shift({ padding: 8 }),
        ],
      });

      setPosition({ x, y });
      // Mark as positioned after first calculation - prevents initial flicker
      setIsPositioned(true);
    };

    // Setup auto-update for scroll/resize
    cleanupRef.current = autoUpdate(anchorEl, popperRef.current, updatePosition);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [open, anchorEl, placement, offsetValue]);

  if (!open) return null;

  const popperContent = (
    <div
      ref={popperRef}
      className={cn("z-50", className)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: `translate(${Math.round(position.x)}px, ${Math.round(position.y)}px)`,
        willChange: "transform",
        // Hide until position is calculated to prevent flicker at (0,0)
        visibility: isPositioned ? "visible" : "hidden",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );

  if (disablePortal) {
    return popperContent;
  }

  const portalContainer = container || (typeof document !== "undefined" ? document.body : null);
  
  if (!portalContainer) return null;

  return createPortal(popperContent, portalContainer);
};

export default ODSPopper;
