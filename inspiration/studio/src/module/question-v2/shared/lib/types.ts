import {
  Mode,
  QuestionTab,
  SidebarKey,
  TQuestion,
  TRescourcesIds,
  TTheme,
  TVariables,
  ViewPort,
} from "@oute/oute-ds.core.constants";
import { CSSProperties } from "react";

export interface UIConfig {
  styles?: {
    chatModeStyles?: CSSProperties;
    cardModeStyles?: CSSProperties;
    classicModeStyles?: CSSProperties;
  } & CSSProperties;
  theme?: TTheme;
  mode: Mode;
  viewPort: ViewPort;
}

export interface StateConfig {
  isCreator: boolean;
  isAnswering?: boolean;
  setIsAnswering?: (value: boolean) => void;
  isAnswered?: boolean;
  showHelp?: boolean;
  isPreviewMode?: boolean;
  rescourcesIds?: TRescourcesIds;
  answers?: Record<string, any>;
  annotation?: any;
  selectedSubQuestionId?: string;
  hideQuestionIndex?: boolean;
  isRetrying?: boolean;
}

export interface Handlers {
  onChange: (key: string, value: any) => void;
  onSubmit?: (...args: any[]) => void;
  onRestart?: () => void;
  onMount?: () => void;
  goToTab?: (tab: QuestionTab, options?: Record<string, any>) => void;
  showSidebar?: (sideBarKey: SidebarKey, options?: Record<string, any>) => void;
  onSubQuestionSelect?: (questionId: string) => void;
  onQuestionEditorFocus?: () => void;
  onCTAClick?: () => void;
  onCountryClick?: () => void;
}

export interface NodeDataConfig {
  node?: Record<string, any>;
  state?: Record<string, any>;
}

export interface CanvasConfig {
  workspaceId?: string;
}

export interface QuestionRendererProps {
  uiConfig: UIConfig;
  questionData: TQuestion;
  stateConfig: StateConfig;
  handlers: Handlers;
  nodeConfig?: NodeDataConfig;
  variables?: TVariables;
  questionIndex?: string;
  value: any;
  loading?: boolean;
  autoFocus?: boolean;
  error?: string;
  id?: string;
  canvasConfig?: CanvasConfig;
}
