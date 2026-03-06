import { useCoachMarkContext } from './CoachMarkProvider';
import { useCoachMarkStore } from './coach-marks-store';

export function useCoachMark(id?: string) {
  const { startJourney, triggerMark } = useCoachMarkContext();
  const store = useCoachMarkStore();

  const isActive = id ? store.activeMarkId === id : false;
  const isSeen = id ? !!store.seen[id] : false;
  const isDismissed = id ? !!store.dismissed[id] : false;

  return {
    isActive,
    isSeen,
    isDismissed,
    startJourney,
    triggerMark,
    dismissMark: store.dismissMark,
    resetAll: store.resetAll,
    globallyDisabled: store.globallyDisabled,
  };
}
