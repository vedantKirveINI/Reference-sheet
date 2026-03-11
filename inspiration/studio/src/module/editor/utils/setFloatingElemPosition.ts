/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const VERTICAL_GAP = 6;
const HORIZONTAL_OFFSET = 0;

/** Find the nearest scroll container (element with overflow-y auto/scroll) for boundary checks */
export function getScrollContainer(element: HTMLElement | null): HTMLElement | null {
  let parent = element?.parentElement ?? null;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

export function setFloatingElemPosition(
  targetRect: DOMRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  isLink: boolean = false,
  verticalGap: number = VERTICAL_GAP,
  horizontalOffset: number = HORIZONTAL_OFFSET
): void {
  const fallbackScroller =
    anchorElem.parentElement?.parentElement?.parentElement ?? null;
  const scrollerElem = getScrollContainer(anchorElem) ?? fallbackScroller;

  if (targetRect === null || !scrollerElem) {
    floatingElem.style.opacity = "0";
    floatingElem.style.transform = "translate(-10000px, -10000px)";
    return;
  }

  const floatingElemRect = floatingElem.getBoundingClientRect();
  const anchorElementRect = anchorElem.getBoundingClientRect();
  const editorScrollerRect = scrollerElem.getBoundingClientRect();

  let top = targetRect.top - floatingElemRect.height - verticalGap;
  let left = targetRect.left - horizontalOffset;

  if (top < editorScrollerRect.top) {
    // Not enough space above: place toolbar below the selection
    top +=
      floatingElemRect.height +
      targetRect.height +
      verticalGap * (isLink ? 3 : 2);
  }

  // Clamp to prevent toolbar from being cut off at the bottom
  if (top + floatingElemRect.height > editorScrollerRect.bottom - verticalGap) {
    top = editorScrollerRect.bottom - floatingElemRect.height - verticalGap;
  }

  if (left + floatingElemRect.width > editorScrollerRect.right) {
    left = editorScrollerRect.right - floatingElemRect.width - horizontalOffset;
  }

  if (left < editorScrollerRect.left) {
    left = editorScrollerRect.left;
  }

  top -= anchorElementRect.top;
  left -= anchorElementRect.left;

  floatingElem.style.opacity = "1";
  floatingElem.style.transform = `translate(${left}px, ${top}px)`;
}
