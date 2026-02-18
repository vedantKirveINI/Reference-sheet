/**
 * Reusable event listener hook with proper cleanup
 * Inspired by Teable's useEventListener
 *
 * Provides a React hook for attaching event listeners that automatically
 * clean up when the component unmounts or dependencies change
 */

import { useRef, useEffect } from "react";

/**
 * Hook to attach event listeners with automatic cleanup
 *
 * @param eventName - Name of the event to listen for
 * @param handler - Event handler function
 * @param element - Element to attach listener to (HTMLElement or Window)
 * @param passive - Whether listener is passive
 * @param capture - Whether to use capture phase (default: false)
 *
 * @example
 * ```tsx
 * useEventListener('wheel', handleWheel, containerRef.current, false);
 * ```
 */
export const useEventListener = <K extends keyof HTMLElementEventMap>(
	eventName: K,
	handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
	element: HTMLElement | Window | null,
	passive: boolean,
	capture = false,
) => {
	const savedHandler =
		useRef<(this: HTMLElement, ev: HTMLElementEventMap[K]) => void>();

	savedHandler.current = handler;

	useEffect(() => {
		if (element === null || element.addEventListener === undefined) return;

		const el = element as HTMLElement;
		const eventListener = (event: HTMLElementEventMap[K]) => {
			savedHandler.current?.call(el, event);
		};

		el.addEventListener(eventName, eventListener, { passive, capture });

		return () => {
			el.removeEventListener(eventName, eventListener, { capture });
		};
	}, [eventName, element, passive, capture]);
};
