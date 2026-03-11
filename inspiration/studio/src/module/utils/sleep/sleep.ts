import { isLocalEnvironment } from "../helper/is-local-environment";

/**
 * Asynchronously sleeps for a specified amount of time.
 * @param {number} ms - The number of milliseconds to sleep.
 * @param {boolean} shouldSleep - Flag to determine if sleep should occur.
 * @returns {Promise<void>} - A Promise that resolves after the sleep duration.
 */
export async function sleep(
  ms: number = 1000,
  shouldSleep: boolean = isLocalEnvironment()
) {
  if (!shouldSleep || ms < 0 || isNaN(ms)) {
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
}
