import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CoachMarkStoreState } from './types';
import { JOURNEYS } from './coach-marks-config';

export const useCoachMarkStore = create<CoachMarkStoreState>()(
  persist(
    (set, get) => ({
      seen: {},
      dismissed: {},
      journeysDismissed: {},
      globallyDisabled: false,
      activeMarkId: null,
      activeJourneyId: null,
      currentStepIndex: 0,

      markSeen: (id) =>
        set((s) => ({ seen: { ...s.seen, [id]: true } })),

      dismissMark: (id) =>
        set((s) => ({
          dismissed: { ...s.dismissed, [id]: true },
          activeMarkId: s.activeMarkId === id ? null : s.activeMarkId,
        })),

      dismissJourney: (journeyId) =>
        set((s) => ({
          journeysDismissed: { ...s.journeysDismissed, [journeyId]: true },
          activeMarkId: null,
          activeJourneyId: s.activeJourneyId === journeyId ? null : s.activeJourneyId,
          currentStepIndex: 0,
        })),

      startJourney: (journeyId) => {
        const s = get();
        if (s.globallyDisabled) return;
        if (s.journeysDismissed[journeyId]) return;
        const steps = JOURNEYS[journeyId];
        if (!steps || steps.length === 0) return;
        set({
          activeJourneyId: journeyId,
          currentStepIndex: 0,
          activeMarkId: steps[0],
        });
      },

      nextStep: () => {
        const s = get();
        if (!s.activeJourneyId) {
          set({ activeMarkId: null });
          return;
        }
        const steps = JOURNEYS[s.activeJourneyId];
        if (!steps) {
          set({ activeMarkId: null, activeJourneyId: null, currentStepIndex: 0 });
          return;
        }
        const nextIndex = s.currentStepIndex + 1;
        if (nextIndex >= steps.length) {
          set({
            activeMarkId: null,
            activeJourneyId: null,
            currentStepIndex: 0,
            journeysDismissed: { ...s.journeysDismissed, [s.activeJourneyId]: true },
            seen: { ...s.seen, [s.activeMarkId ?? '']: true },
          });
        } else {
          set({
            currentStepIndex: nextIndex,
            activeMarkId: steps[nextIndex],
            seen: { ...s.seen, [s.activeMarkId ?? '']: true },
          });
        }
      },

      prevStep: () => {
        const s = get();
        if (!s.activeJourneyId) return;
        const steps = JOURNEYS[s.activeJourneyId];
        if (!steps) return;
        const prevIndex = Math.max(0, s.currentStepIndex - 1);
        set({
          currentStepIndex: prevIndex,
          activeMarkId: steps[prevIndex],
        });
      },

      setActiveMark: (id) => set({ activeMarkId: id }),

      setGloballyDisabled: (disabled) =>
        set({
          globallyDisabled: disabled,
          activeMarkId: disabled ? null : get().activeMarkId,
        }),

      resetAll: () =>
        set({
          seen: {},
          dismissed: {},
          journeysDismissed: {},
          globallyDisabled: false,
          activeMarkId: null,
          activeJourneyId: null,
          currentStepIndex: 0,
        }),
    }),
    {
      name: 'tt-coach-marks-v1',
      partialize: (state) => ({
        seen: state.seen,
        dismissed: state.dismissed,
        journeysDismissed: state.journeysDismissed,
        globallyDisabled: state.globallyDisabled,
      }),
    }
  )
);
