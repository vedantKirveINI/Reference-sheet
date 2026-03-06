import { useCallback, useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CoachMarkContext } from './CoachMarkContext';
import type { CoachMarkContextValue } from './types';
import { useCoachMarkStore } from './coach-marks-store';
import { COACH_MARKS } from './coach-marks-config';
import { CoachMarkTooltip } from './CoachMarkTooltip';

interface CoachMarkProviderProps {
  children: React.ReactNode;
}

export function CoachMarkProvider({ children }: CoachMarkProviderProps) {
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const store = useCoachMarkStore();
  const [, forceUpdate] = useState(0);
  const forceUpdateScheduled = useRef(false);

  const registerRef = useCallback((id: string, el: HTMLElement | null) => {
    refs.current[id] = el;
    if (el && !forceUpdateScheduled.current) {
      forceUpdateScheduled.current = true;
      setTimeout(() => {
        forceUpdateScheduled.current = false;
        forceUpdate((n) => n + 1);
      }, 0);
    }
  }, []);

  const getRef = useCallback((id: string) => {
    return refs.current[id] ?? null;
  }, []);

  const startJourney = useCallback(
    (journeyId: string) => {
      store.startJourney(journeyId);
    },
    [store]
  );

  const triggerMark = useCallback(
    (id: string) => {
      if (store.globallyDisabled) return;
      if (store.seen[id] || store.dismissed[id]) return;
      const mark = COACH_MARKS[id];
      if (!mark) return;
      store.markSeen(id);
      store.setActiveMark(id);
    },
    [store]
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    const isReset = url.searchParams.has('reset-tour');

    if (isReset) {
      url.searchParams.delete('reset-tour');
      window.history.replaceState(null, '', url.toString());
      store.resetAll();
      const timer = setTimeout(() => {
        store.startJourney('journey-welcome');
      }, 800);
      return () => clearTimeout(timer);
    }

    if (store.globallyDisabled) return;
    const alreadyStarted =
      store.seen['cm-add-table'] ||
      store.journeysDismissed['journey-welcome'] ||
      store.activeJourneyId === 'journey-welcome';
    if (!alreadyStarted) {
      const timer = setTimeout(() => {
        store.startJourney('journey-welcome');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const activeMarkId = store.activeMarkId;
  const targetEl = activeMarkId ? refs.current[activeMarkId] ?? null : null;

  const showCentered =
    activeMarkId && COACH_MARKS[activeMarkId]?.placement === 'center';

  const canRender =
    activeMarkId &&
    !store.globallyDisabled &&
    (showCentered || targetEl);

  const ctx: CoachMarkContextValue = {
    registerRef,
    getRef,
    startJourney,
    triggerMark,
  };

  return (
    <CoachMarkContext.Provider value={ctx}>
      {children}
      {canRender &&
        createPortal(
          <CoachMarkTooltip
            key={activeMarkId}
            markId={activeMarkId!}
            targetEl={targetEl ?? document.body}
          />,
          document.body
        )}
    </CoachMarkContext.Provider>
  );
}
