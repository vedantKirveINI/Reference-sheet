/**
 * Timeout utilities using requestAnimationFrame
 * Inspired by Teable's timeout utilities
 *
 * Provides requestTimeout and cancelTimeout that use requestAnimationFrame
 * for better performance and smooth animations
 */

/**
 * Type for timeout ID returned by requestTimeout
 */
export type ITimeoutID = {
	id: number;
};

/**
 * Cancels a timeout created with requestTimeout
 *
 * @param timeoutID - The timeout ID to cancel
 */
export const cancelTimeout = (timeoutID: ITimeoutID) => {
	cancelAnimationFrame(timeoutID.id);
};

/**
 * Creates a timeout that uses requestAnimationFrame for better performance
 *
 * @param callback - Function to call after delay
 * @param delay - Delay in milliseconds
 * @returns Timeout ID that can be used with cancelTimeout
 */
export const requestTimeout = (
	callback: () => void,
	delay: number,
): ITimeoutID => {
	const start = Date.now();

	function tick() {
		if (Date.now() - start >= delay) {
			callback.call(null);
		} else {
			timeoutID.id = requestAnimationFrame(tick);
		}
	}

	const timeoutID: ITimeoutID = {
		id: requestAnimationFrame(tick),
	};
	return timeoutID;
};
