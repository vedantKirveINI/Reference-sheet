/**
 * InfiniteScroller - Custom scrollbar component
 * Inspired by Teable's InfiniteScroller
 *
 * Renders two absolute-positioned scrollbars:
 * - Horizontal scrollbar at bottom
 * - Vertical scrollbar on right
 */

import {
	forwardRef,
	useRef,
	useCallback,
	useMemo,
	useImperativeHandle,
	UIEvent,
	type ReactNode,
} from "react";
import type { IInfiniteScrollerProps, IScrollerRef } from "@/types";
import { SCROLLBAR_WIDTH, SCROLLBAR_HEIGHT } from "@/config/grid";
// Phase 1 utilities
import { getWheelDelta } from "@/utils/wheelUtils";
import {
	requestTimeout,
	cancelTimeout,
	type ITimeoutID,
} from "@/utils/timeoutUtils";
import { useEventListener } from "@/hooks/useEventListener";
import {
	getVerticalRangeInfo,
	getHorizontalRangeInfo,
} from "@/hooks/useVisibleRegion";

const InfiniteScrollerBase = forwardRef<IScrollerRef, IInfiniteScrollerProps>(
	(props, ref) => {
		const {
			coordInstance,
			containerWidth,
			containerHeight,
			scrollWidth,
			scrollHeight,
			containerRef,
			setScrollState,
			onScrollChanged,
			scrollBarVisible = true,
			top = 0,
			left = 0,
			smoothScrollX = true,
			smoothScrollY = true,
			scrollEnable = true,
			getLinearRow,
			onVisibleRegionChanged,
			zoomLevel = 100, // Default to 100% zoom
		} = props;

		// Refs for scrollbar DOM elements
		const horizontalScrollRef = useRef<HTMLDivElement | null>(null);
		const verticalScrollRef = useRef<HTMLDivElement | null>(null);
		const resetScrollingTimeoutID = useRef<ITimeoutID | null>(null);
		const offsetY = useRef(0); // Virtual offset for large datasets
		const lastScrollTop = useRef(0); // Track last scroll position

		// Expose scroll methods via imperative handle (ref)
		useImperativeHandle(ref, () => ({
			scrollTo: (sl?: number, st?: number) => {
				if (horizontalScrollRef.current && sl != null) {
					horizontalScrollRef.current.scrollLeft = sl;
				}
				if (verticalScrollRef.current && st != null) {
					const el = verticalScrollRef.current;
					const scrollableHeight = el.scrollHeight - el.clientHeight;
					let virtualOffsetY = 0;
					if (
						scrollableHeight > 0 &&
						scrollHeight > el.scrollHeight + 5
					) {
						const prog = st / (scrollHeight - el.clientHeight);
						const actualScrollTop = scrollableHeight * prog;
						virtualOffsetY = actualScrollTop - st;
					}
					verticalScrollRef.current.scrollTop = st + virtualOffsetY;
				}
			},
			scrollBy: (deltaX: number, deltaY: number) => {
				if (horizontalScrollRef.current) {
					horizontalScrollRef.current.scrollLeft += deltaX;
				}
				if (verticalScrollRef.current) {
					verticalScrollRef.current.scrollTop += deltaY;
				}
			},
		}));

		// eslint-disable-next-line sonarjs/cognitive-complexity
		const onScroll = (
			_e: UIEvent<HTMLDivElement>,
			direction: "horizontal" | "vertical",
		) => {
			if (!verticalScrollRef.current || !horizontalScrollRef.current) {
				return;
			}
			const { rowInitSize, columnInitSize } = coordInstance;
			const zoomScale = zoomLevel / 100;

			// Ref approach: always read BOTH axes from DOM refs so we never pass stale state.
			// This fixes jitter when both scrollbars fire (e.g. diagonal wheel) and the second
			// handler would otherwise overwrite with stale "other axis" from closure state.
			const rawScrollTop = verticalScrollRef.current.scrollTop;
			const rawScrollLeft = horizontalScrollRef.current.scrollLeft;
			const logicalScrollTopFromRef =
				(rawScrollTop + offsetY.current) / zoomScale;
			const logicalScrollLeftFromRef = rawScrollLeft / zoomScale;

			let scrollProps: { [key: string]: number } = {};

			if (direction === "vertical") {
				const delta = lastScrollTop.current - rawScrollTop;
				const vertEl = verticalScrollRef.current;
				const scrollableHeight =
					vertEl.scrollHeight - vertEl.clientHeight;
				lastScrollTop.current = rawScrollTop;

				// Virtual offset recalculation for large datasets
				if (
					scrollableHeight > 0 &&
					(Math.abs(delta) > 2000 ||
						rawScrollTop === 0 ||
						rawScrollTop === scrollableHeight) &&
					scrollHeight > vertEl.scrollHeight + 5
				) {
					const prog = rawScrollTop / scrollableHeight;
					const recomputed =
						(scrollHeight - vertEl.clientHeight) * prog;
					offsetY.current = recomputed - rawScrollTop;
				}
				const rowIndex = coordInstance.getRowStartIndex(
					logicalScrollTopFromRef,
				);
				const rowOffset = coordInstance.getRowOffset(rowIndex);
				scrollProps = {
					scrollTop: !smoothScrollY
						? rowOffset - rowInitSize
						: logicalScrollTopFromRef,
				};
			}

			if (direction === "horizontal") {
				const colIndex = coordInstance.getColumnStartIndex(
					logicalScrollLeftFromRef,
				);
				const colOffset = coordInstance.getColumnOffset(colIndex);
				scrollProps = {
					scrollLeft: !smoothScrollX
						? colOffset - columnInitSize
						: logicalScrollLeftFromRef,
				};
			}

			// Use ref-derived values for both axes (no stale state)
			const finalScrollTop =
				scrollProps.scrollTop ?? logicalScrollTopFromRef;
			const finalScrollLeft =
				scrollProps.scrollLeft ?? logicalScrollLeftFromRef;

			const { startRowIndex, stopRowIndex } = getVerticalRangeInfo(
				coordInstance,
				finalScrollTop,
			);
			const { startColumnIndex, stopColumnIndex } =
				getHorizontalRangeInfo(coordInstance, finalScrollLeft);

			const realStartRowIndex =
				getLinearRow(startRowIndex).realIndex ?? startRowIndex;
			const realStopRowIndex =
				getLinearRow(stopRowIndex).realIndex ?? stopRowIndex;

			onVisibleRegionChanged?.({
				x: startColumnIndex,
				y: realStartRowIndex,
				width: stopColumnIndex - startColumnIndex,
				height: realStopRowIndex - realStartRowIndex,
			});

			onScrollChanged?.(finalScrollLeft, finalScrollTop);

			setScrollState((prev) => ({
				...prev,
				scrollTop: finalScrollTop,
				scrollLeft: finalScrollLeft,
				isScrolling: true,
			}));

			resetScrollingDebounced();
		};

		const resetScrolling = useCallback(() => {
			setScrollState((prev) => ({ ...prev, isScrolling: false }));
			resetScrollingTimeoutID.current = null;
		}, [setScrollState]);

		const resetScrollingDebounced = useCallback(() => {
			if (resetScrollingTimeoutID.current !== null) {
				cancelTimeout(resetScrollingTimeoutID.current);
			}
			resetScrollingTimeoutID.current = requestTimeout(
				resetScrolling,
				200,
			);
		}, [resetScrolling]);

		const scrollHandler = useCallback((deltaX: number, deltaY: number) => {
			if (horizontalScrollRef.current) {
				horizontalScrollRef.current.scrollLeft =
					horizontalScrollRef.current.scrollLeft + deltaX;
			}
			if (verticalScrollRef.current) {
				const realDeltaY = deltaY;
				verticalScrollRef.current.scrollTop =
					verticalScrollRef.current.scrollTop + realDeltaY;
			}
		}, []);

		const onWheel = useCallback(
			(event: Event) => {
				if (!scrollEnable) return;
				event.preventDefault();
				const [fixedDeltaX, fixedDeltaY] = getWheelDelta({
					event: event as WheelEvent,
					pageHeight:
						coordInstance.containerHeight -
						coordInstance.rowInitSize -
						1,
					lineHeight: coordInstance.rowHeight,
				});
				scrollHandler(fixedDeltaX, fixedDeltaY);
			},
			[scrollEnable, scrollHandler, coordInstance],
		);

		// Replace manual useEffect with useEventListener hook
		useEventListener("wheel", onWheel, containerRef.current, false);

		// Generate placeholder divs for vertical scrollbar to make it scrollable
		const verticalPlaceholders: ReactNode[] = useMemo(() => {
			const placeholders = [];
			let totalHeight = 0;
			const chunkSize = 5000000; // Large chunks to avoid too many DOM nodes

			while (totalHeight < scrollHeight) {
				const height = Math.min(chunkSize, scrollHeight - totalHeight);
				placeholders.push(
					<div
						key={`v-placeholder-${totalHeight}`}
						style={{
							width: 0,
							height,
							flexShrink: 0,
						}}
					/>,
				);
				totalHeight += height;
			}

			return placeholders;
		}, [scrollHeight]);

		return (
			<>
				{/* Horizontal Scrollbar - positioned at bottom (like Teable) */}
				<div
					ref={horizontalScrollRef}
					style={{
						position: "absolute",
						bottom: 2, // Like Teable: bottom-[2px]
						left: left, // Like Teable: starts after row header
						width: containerWidth - left, // Like Teable: width = containerWidth - left (no SCROLLBAR_WIDTH subtraction)
						height: SCROLLBAR_HEIGHT,
						overflowY: "hidden",
						overflowX: "scroll",
						opacity: scrollBarVisible ? 1 : 0,
						pointerEvents: scrollBarVisible ? "auto" : "none",
						transition: "opacity 0.2s ease-in-out",
						scrollbarWidth: "thin",
						zIndex: 1000, // Ensure it's on top
					}}
					onScroll={(e) => onScroll(e, "horizontal")}
				>
					{/* Invisible content div that enables scrolling */}
					<div
						style={{
							width: scrollWidth,
							height: 1,
							backgroundColor: "transparent",
							flexShrink: 0,
						}}
					/>
				</div>

				{/* Vertical Scrollbar - positioned on right */}
				<div
					ref={verticalScrollRef}
					style={{
						position: "absolute",
						right: 2,
						top: top,
						width: SCROLLBAR_WIDTH,
						height: containerHeight - top, // Extends from header to just above horizontal scrollbar (like Teable)
						overflowX: "hidden",
						overflowY: "scroll",
						// Vertical visibility should depend on vertical overflow, not horizontal scrollbar flag
						// Show when scrollHeight exceeds available vertical space
						opacity:
							scrollHeight > Math.max(0, containerHeight - top)
								? 1
								: 0,
						pointerEvents:
							scrollHeight > Math.max(0, containerHeight - top)
								? "auto"
								: "none",
						transition: "opacity 0.2s ease-in-out",
						scrollbarWidth: "thin",
						zIndex: 1000, // Ensure it's on top
					}}
					onScroll={(e) => onScroll(e, "vertical")}
				>
					{/* Placeholder divs that enable scrolling */}
					<div
						style={{
							width: 1,
							display: "flex",
							flexDirection: "column",
						}}
					>
						{verticalPlaceholders}
					</div>
				</div>
			</>
		);
	},
);

InfiniteScrollerBase.displayName = "InfiniteScroller";

export const InfiniteScroller = InfiniteScrollerBase;
