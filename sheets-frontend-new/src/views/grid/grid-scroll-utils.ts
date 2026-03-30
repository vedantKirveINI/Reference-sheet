export interface ScrollIntoViewInput {
  scrollTop: number;
  scrollLeft: number;
  clientHeight: number;
  clientWidth: number;
  absHeaderHeight: number;
  absRowHeaderWidth: number;
  absCellTop: number;
  absCellBottom: number;
  absCellLeft: number;
  absCellRight: number;
}

export interface ScrollIntoViewResult {
  scrollTop: number;
  scrollLeft: number;
  changed: boolean;
}

export const getMinimalScrollToRevealCell = ({
  scrollTop,
  scrollLeft,
  clientHeight,
  clientWidth,
  absHeaderHeight,
  absRowHeaderWidth,
  absCellTop,
  absCellBottom,
  absCellLeft,
  absCellRight,
}: ScrollIntoViewInput): ScrollIntoViewResult => {
  let nextScrollTop = scrollTop;
  let nextScrollLeft = scrollLeft;

  if (absCellBottom > scrollTop + clientHeight) {
    nextScrollTop = absCellBottom - clientHeight;
  } else if (absCellTop < scrollTop + absHeaderHeight) {
    nextScrollTop = absCellTop - absHeaderHeight;
  }

  if (absCellRight > scrollLeft + clientWidth) {
    nextScrollLeft = absCellRight - clientWidth;
  } else if (absCellLeft < scrollLeft + absRowHeaderWidth) {
    nextScrollLeft = absCellLeft - absRowHeaderWidth;
  }

  nextScrollTop = Math.max(0, nextScrollTop);
  nextScrollLeft = Math.max(0, nextScrollLeft);

  return {
    scrollTop: nextScrollTop,
    scrollLeft: nextScrollLeft,
    changed: nextScrollTop !== scrollTop || nextScrollLeft !== scrollLeft,
  };
};
