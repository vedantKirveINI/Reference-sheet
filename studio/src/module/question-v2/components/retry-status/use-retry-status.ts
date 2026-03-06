import { useEffect, useState, useRef } from "react";

interface RetryStatusState {
  messageIndex: number; // 1-4 = retry messages (always show a message)
  countdown: number; // seconds remaining until next threshold
  elapsedTime: number; // total elapsed time in seconds
}

const MESSAGE_THRESHOLDS = {
  MESSAGE_1_START: 5, // seconds
  MESSAGE_2_START: 10, // seconds
  MESSAGE_3_START: 15, // seconds
  MESSAGE_4_START: 30, // seconds
  MESSAGE_4_CYCLE: 30, // seconds (repeat cycle)
} as const;

export function useRetryStatus(isRetrying: boolean) {
  const [state, setState] = useState<RetryStatusState>({
    messageIndex: 1,
    countdown: 5,
    elapsedTime: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRetrying) {
      // Reset state when not retrying
      setState({
        messageIndex: 1,
        countdown: 5,
        elapsedTime: 0,
      });
      startTimeRef.current = null;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initialize start time
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }

    // Update state every second
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }

      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);

      let messageIndex = 1;
      let countdown = 0;

      if (elapsedSeconds < MESSAGE_THRESHOLDS.MESSAGE_1_START) {
        // 0-5s: Show constant message + message 1
        messageIndex = 1;
        countdown = MESSAGE_THRESHOLDS.MESSAGE_1_START - elapsedSeconds;
      } else if (elapsedSeconds < MESSAGE_THRESHOLDS.MESSAGE_2_START) {
        // 5-10s: Show constant message + message 2
        messageIndex = 2;
        countdown = MESSAGE_THRESHOLDS.MESSAGE_2_START - elapsedSeconds;
      } else if (elapsedSeconds < MESSAGE_THRESHOLDS.MESSAGE_3_START) {
        // 10-15s: Show constant message + message 3
        messageIndex = 3;
        countdown = MESSAGE_THRESHOLDS.MESSAGE_3_START - elapsedSeconds;
      } else if (elapsedSeconds < MESSAGE_THRESHOLDS.MESSAGE_4_START) {
        // 15-30s: Show constant message + message 4
        messageIndex = 4;
        countdown = MESSAGE_THRESHOLDS.MESSAGE_4_START - elapsedSeconds;
      } else {
        // 30s+: Message 4 (repeats every 30s)
        messageIndex = 4;
        const cyclePosition =
          (elapsedSeconds - MESSAGE_THRESHOLDS.MESSAGE_4_START) %
          MESSAGE_THRESHOLDS.MESSAGE_4_CYCLE;
        countdown = MESSAGE_THRESHOLDS.MESSAGE_4_CYCLE - cyclePosition;
      }

      setState({
        messageIndex,
        countdown: Math.max(0, countdown),
        elapsedTime: elapsedSeconds,
      });
    }, 1000);

    // Cleanup on unmount or when isRetrying changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRetrying]);

  return state;
}
