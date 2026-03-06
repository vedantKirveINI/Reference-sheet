import { createContext, useContext } from 'react';
import type { CoachMarkContextValue } from './types';

export const CoachMarkContext = createContext<CoachMarkContextValue>({
  registerRef: () => {},
  getRef: () => null,
  startJourney: () => {},
  triggerMark: () => {},
});

export function useCoachMarkContext() {
  return useContext(CoachMarkContext);
}
