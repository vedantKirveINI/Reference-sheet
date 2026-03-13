import { useState, useLayoutEffect } from 'react';

type PopoverSide = 'top' | 'bottom' | 'left' | 'right';

interface UseAdaptivePopoverSideOptions {
  /** Element that triggers the popover (e.g. country button). */
  triggerRef: React.RefObject<HTMLElement | null>;
  /** Whether the popover is currently open. */
  open: boolean;
  /**
   * Estimated popover size (in px). Used before the real size is known.
   * This keeps the logic simple and avoids measuring the portal content.
   */
  estimatedHeight?: number;
  estimatedWidth?: number;
  /**
   * Optional boundary element (e.g. grid viewport). If not provided, the
   * viewport (window) is used as the collision boundary.
   */
  boundaryElement?: HTMLElement | null;
}

interface AdaptivePopoverResult {
  side: PopoverSide;
}

/**
 * Compute the best side for a popover around a trigger element.
 *
 * Priority:
 * 1) bottom  – if there is enough vertical space
 * 2) top     – if there is enough vertical space
 * 3) right   – if there is enough horizontal space
 * 4) left    – fallback when nothing else fits
 *
 * This mirrors the technical flow used by the grid cell popup editors:
 * try bottom, then top, then right, finally left.
 */
export function useAdaptivePopoverSide({
  triggerRef,
  open,
  estimatedHeight = 260,
  estimatedWidth = 320,
  boundaryElement,
}: UseAdaptivePopoverSideOptions): AdaptivePopoverResult {
  const [side, setSide] = useState<PopoverSide>('bottom');

  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const boundaryRect = boundaryElement
      ? boundaryElement.getBoundingClientRect()
      : {
          top: 0,
          left: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
        };

    const spaceBottom = boundaryRect.bottom - rect.bottom;
    const spaceTop = rect.top - boundaryRect.top;
    const spaceRight = boundaryRect.right - rect.right;
    const spaceLeft = rect.left - boundaryRect.left;

    let next: PopoverSide = 'bottom';

    if (spaceBottom >= estimatedHeight) {
      next = 'bottom';
    } else if (spaceTop >= estimatedHeight) {
      next = 'top';
    } else if (spaceRight >= estimatedWidth) {
      next = 'right';
    } else {
      next = 'left';
    }

    setSide(next);
  }, [open, triggerRef, boundaryElement, estimatedHeight, estimatedWidth]);

  return { side };
}

