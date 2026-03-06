export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'center';

export interface CoachMarkDefinition {
  id: string;
  journeyId: string | null;
  stepIndex: number;
  title: string;
  description: string;
  placement: PopoverPlacement;
  showCondition?: string;
}

export interface CoachMarkStoreState {
  seen: Record<string, boolean>;
  dismissed: Record<string, boolean>;
  journeysDismissed: Record<string, boolean>;
  globallyDisabled: boolean;
  activeMarkId: string | null;
  activeJourneyId: string | null;
  currentStepIndex: number;

  markSeen: (id: string) => void;
  dismissMark: (id: string) => void;
  dismissJourney: (journeyId: string) => void;
  startJourney: (journeyId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  setActiveMark: (id: string | null) => void;
  setGloballyDisabled: (disabled: boolean) => void;
  resetAll: () => void;
}

export interface CoachMarkContextValue {
  registerRef: (id: string, el: HTMLElement | null) => void;
  getRef: (id: string) => HTMLElement | null;
  startJourney: (journeyId: string) => void;
  triggerMark: (id: string) => void;
}
