import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import {
  Mode,
  QuestionType,
  ViewPort,
  SETTINGS_INPUT_NAMES,
} from "@oute/oute-ds.core.constants";
import { localStorageConstants } from "@src/module/constants";
import {
  getMultiQuestionErrors,
  getSingleChoiceQuestionErrors,
  getRankingQuestionErrors,
  getDropdownQuestionErrors,
} from "./nodes";

interface QuestionContextProps {
  question: Record<string, any>;
  mode: Mode;
  viewPort: ViewPort;
  theme: Record<string, any>;
  activeQuestionIdToShow: string | null;
  settingsInputToFocus: SETTINGS_INPUT_NAMES | null;
  onSettingsInputToFocusChange: (
    newSettingInputToFocus: SETTINGS_INPUT_NAMES | null
  ) => void;
  onActiveQuestionIdToShowChange: (
    newActiveQuestionIdToShow: string | null
  ) => void;
  onSettingsChange: (newSettings: Record<string, any>) => void;
  onModeChange: (newMode: Mode) => void;
  onViewPortChange: (newViewPort: ViewPort) => void;
  onQuestionChange: (newQuestion: Record<string, any>) => void;
  onThemeChange: (newTheme: Record<string, any>) => void;
  onQuestionDataChange: (questionData: Record<string, any>) => void;
  onNestedQuestionDataChange: (questionData: Record<string, any>) => void;
  onImageChange: (url: string, blocks: any) => void;
  onNestedQuestionSettingsChange: (settings: Record<string, any>) => void;
  onGoToTabTriggerConfigChange: (config: TGoToTabTriggerConfig | null) => void;
  onGoToTabEventFinish: () => void;
  getNodeErrors: ({ initialSave }: { initialSave: boolean }) => {
    errors: string[];
    settingsErrors: Record<string, string>;
  };
  setQuestion: (question: Record<string, any>) => void;
}

const QuestionContext = createContext<QuestionContextProps | null>(null);

interface QuestionProviderProps {
  children: ReactNode;
  defaultMode: Mode;
  defaultViewPort: ViewPort;
  defaultQuestion: Record<string, any>;
  defaultTheme: Record<string, any>;
}

export type TGoToTabTriggerConfig = {
  event: string;
} & Record<string, any>;

const QuestionProvider = ({
  children,
  defaultMode,
  defaultQuestion,
  defaultViewPort,
  defaultTheme,
}: QuestionProviderProps) => {
  const [question, setQuestion] = useState(defaultQuestion);
  const [mode, setMode] = useState(defaultMode);
  const [viewPort, setViewPort] = useState(defaultViewPort);
  const [theme, setTheme] = useState(defaultTheme);
  const [settingsInputToFocus, setSettingsInputToFocus] =
    useState<SETTINGS_INPUT_NAMES | null>(null);
  const [activeQuestionIdToShow, setActiveQuestionIdToShow] = useState<
    string | null
  >(null);
  const goToTabTriggerConfigRef = useRef<TGoToTabTriggerConfig | null>(null);

  const onActiveQuestionIdToShowChange = useCallback(
    (newActiveQuestionIdToShow: string | null) => {
      setActiveQuestionIdToShow(newActiveQuestionIdToShow);
    },
    []
  );

  const onThemeChange = useCallback((newTheme: Record<string, any>) => {
    setTheme(newTheme);
  }, []);

  const onQuestionDataChange = useCallback(
    (questionData = {}) => {
      setQuestion((prev) => ({
        ...prev,
        ...questionData,
      }));
    },
    [setQuestion]
  );

  const onSettingsChange = useCallback(
    (settings = {}) => {
      setQuestion((prev) => ({
        ...prev,
        ...settings,
      }));
    },
    [setQuestion]
  );

  const onGoToTabTriggerConfigChange = useCallback(
    (config: TGoToTabTriggerConfig | null) => {
      goToTabTriggerConfigRef.current = config;
    },
    []
  );

  const getNodeErrors = useCallback(
    ({ initialSave = false }: { initialSave: boolean }) => {
      let errors: string[] = Object.values(
        question?.settings?.errors || {}
      ).filter(
        (error: unknown) => typeof error === "string" && error?.trim?.() !== ""
      ) as string[];
      let settingsErrors: Record<string, string> = {};

      if (initialSave) {
        return { errors: [], settingsErrors: {} };
      }

      switch (question?.type) {
        case QuestionType.MCQ:
          return getMultiQuestionErrors(question);
        case QuestionType.SCQ:
          return getSingleChoiceQuestionErrors(question);
        case QuestionType.RANKING:
          return getRankingQuestionErrors(question);
        case QuestionType.DROP_DOWN:
        case QuestionType.DROP_DOWN_STATIC:
          return getDropdownQuestionErrors(question);
      }

      return { errors, settingsErrors };
    },
    [question]
  );

  const onGoToTabEventFinish = useCallback(() => {
    goToTabTriggerConfigRef.current = null;
  }, []);

  const onImageChange = useCallback(
    (val) => {
      if (question?.type === QuestionType.LOADING) {
        setQuestion((prevQuestion) => {
          const updatedQues = {
            ...prevQuestion,
            loadingUrl: val?.url,
            augmentor: {},
          };
          return updatedQues;
        });
        return;
      }
      if (goToTabTriggerConfigRef.current?.openAddImage) {
        if (question?.type === QuestionType.PICTURE) {
          setQuestion((prevQuestion) => ({
            ...prevQuestion,
            options: prevQuestion?.options?.map((option) =>
              option.id === goToTabTriggerConfigRef.current?.id
                ? { ...option, imgSrc: val.url }
                : option
            ),
          }));
        }
        onGoToTabEventFinish();
        return;
      }
      setQuestion((prevQuestion) => {
        const updatedQues = {
          ...prevQuestion,
          augmentor: {
            ...val,
          },
        };
        return updatedQues;
      });
    },
    [question?.type, setQuestion]
  );

  const onQuestionChange = useCallback((newQuestion: Record<string, any>) => {
    setQuestion((prevQuestion) => ({
      ...prevQuestion,
      ...newQuestion,
    }));
  }, []);

  const onModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(localStorageConstants.QUESTION_CREATOR_MODE, newMode);
    }
  }, []);

  const onViewPortChange = useCallback((newViewPort: ViewPort) => {
    setViewPort(newViewPort);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(
        localStorageConstants.QUESTION_CREATOR_VIEWPORT,
        newViewPort
      );
    }
  }, []);

  const onNestedQuestionDataChange = useCallback(
    (questionData = {}) => {
      const updatedQuestion = {
        ...question?.questions,
        [activeQuestionIdToShow]: {
          ...question?.questions[activeQuestionIdToShow],
          ...questionData,
        },
      };
      setQuestion((prev) => {
        return {
          ...prev,
          questions: updatedQuestion,
        };
      });
    },
    [question?.questions, activeQuestionIdToShow]
  );

  const onNestedQuestionSettingsChange = useCallback(
    (settings = {}) => {
      const updatedQuestion = {
        ...question?.questions,
        [activeQuestionIdToShow]: {
          ...question?.questions[activeQuestionIdToShow],
          ...settings,
        },
      };
      setQuestion((prev) => {
        return {
          ...prev,
          questions: updatedQuestion,
        };
      });
    },
    [question?.questions, activeQuestionIdToShow]
  );

  const onSettingsInputToFocusChange = useCallback(
    (newSettingInputToFocus: SETTINGS_INPUT_NAMES | null) => {
      setSettingsInputToFocus(newSettingInputToFocus);
    },
    []
  );

  return (
    <QuestionContext.Provider
      value={{
        question,
        mode,
        viewPort,
        theme,
        activeQuestionIdToShow,
        settingsInputToFocus,
        setQuestion,
        onSettingsInputToFocusChange,
        onActiveQuestionIdToShowChange,
        onThemeChange,
        onModeChange,
        onViewPortChange,
        onQuestionChange,
        onSettingsChange,
        onQuestionDataChange,
        onImageChange,
        onNestedQuestionSettingsChange,
        onGoToTabTriggerConfigChange,
        onGoToTabEventFinish,
        onNestedQuestionDataChange,
        getNodeErrors,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};

const defaultQuestionContext: QuestionContextProps = {
  question: {},
  mode: Mode.CARD,
  viewPort: ViewPort.DESKTOP,
  theme: {},
  activeQuestionIdToShow: null,
  settingsInputToFocus: null,
  onSettingsInputToFocusChange: () => {},
  onActiveQuestionIdToShowChange: () => {},
  onSettingsChange: () => {},
  onModeChange: () => {},
  onViewPortChange: () => {},
  onQuestionChange: () => {},
  onThemeChange: () => {},
  onQuestionDataChange: () => {},
  onNestedQuestionDataChange: () => {},
  onImageChange: () => {},
  onNestedQuestionSettingsChange: () => {},
  onGoToTabTriggerConfigChange: () => {},
  onGoToTabEventFinish: () => {},
  getNodeErrors: () => ({ errors: [], settingsErrors: {} }),
  setQuestion: () => {},
};

const useQuestionContext = () => {
  const context = useContext(QuestionContext);
  if (context === null) {
    if (typeof console !== "undefined" && console.warn) {
      console.warn(
        "useQuestionContext was called outside a QuestionProvider. Using default context. Wrap your component tree with <QuestionProvider> to fix."
      );
    }
    return defaultQuestionContext;
  }
  return context;
};

export { QuestionProvider, useQuestionContext };
