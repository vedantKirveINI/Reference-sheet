import { useState, useEffect, useRef, useCallback } from "react";
import { getProactiveTip } from "./assistantService";

const TIP_COOLDOWN_MS = 60000;
const INITIAL_TIP_DELAY_MS = 8000;

const useProactiveTips = ({ getWorkflowContext, onTipShow, enabled = true }) => {
  const [shownTips, setShownTips] = useState(new Set());
  const [lastTipTime, setLastTipTime] = useState(0);
  const tipCheckIntervalRef = useRef(null);
  const initialDelayRef = useRef(null);

  const checkForTip = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();
    if (now - lastTipTime < TIP_COOLDOWN_MS) return;

    const context = getWorkflowContext?.();
    const tip = getProactiveTip(context);

    if (tip && !shownTips.has(tip.message)) {
      setShownTips((prev) => new Set([...prev, tip.message]));
      setLastTipTime(now);
      onTipShow?.(tip);
    }
  }, [enabled, lastTipTime, shownTips, getWorkflowContext, onTipShow]);

  useEffect(() => {
    if (!enabled) return;

    initialDelayRef.current = setTimeout(() => {
      checkForTip();
    }, INITIAL_TIP_DELAY_MS);

    tipCheckIntervalRef.current = setInterval(() => {
      checkForTip();
    }, TIP_COOLDOWN_MS);

    return () => {
      clearTimeout(initialDelayRef.current);
      clearInterval(tipCheckIntervalRef.current);
    };
  }, [enabled, checkForTip]);

  const triggerTipCheck = useCallback(() => {
    checkForTip();
  }, [checkForTip]);

  const resetTips = useCallback(() => {
    setShownTips(new Set());
    setLastTipTime(0);
  }, []);

  return { triggerTipCheck, resetTips };
};

export default useProactiveTips;
