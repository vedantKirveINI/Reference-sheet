import { createContext, useContext, ReactNode, useState, useCallback, useEffect, useId } from "react";
import { Mode, ViewPort, ModeType, ViewPortType } from "./constants";
import { useEscapeStack } from "@/contexts/EscapeStackContext";
import { localStorageConstants } from "@src/module/constants";

interface Theme {
  id?: string;
  name?: string;
  fonts?: {
    questionColor?: string;
    answerColor?: string;
  };
  buttons?: {
    fillColor?: string;
  };
  background?: {
    color?: string;
  };
}

interface PreviewContextValue {
  mode: ModeType;
  viewport: ViewPortType;
  setMode: (mode: ModeType) => void;
  setViewport: (viewport: ViewPortType) => void;
  restart: () => void;
  close: () => void;
  formName: string;
  onPublish: () => void;
  theme: Theme | null;
  previewTheme: Theme | null;
  effectiveTheme: Theme | null;
  isDefaultTheme: boolean;
  setTheme: (theme: Theme) => void;
  setPreviewTheme: (theme: Theme | null) => void;
  resetSubmissionState: () => void;
  setResetSubmissionState: (fn: () => void) => void;
}

const PreviewContext = createContext<PreviewContextValue | null>(null);

interface PreviewProviderProps {
  children: ReactNode;
  formName: string;
  onClose: () => void;
  onPublish: () => void;
  onRestart?: () => void;
  onThemeChange?: (theme: Theme) => void;
  initialMode?: ModeType;
  initialViewport?: ViewPortType;
  initialTheme?: Theme | null;
}

export function PreviewProvider({
  children,
  formName,
  onClose,
  onPublish,
  onRestart,
  onThemeChange,
  initialMode,
  initialViewport,
  initialTheme,
}: PreviewProviderProps) {
  const [mode, setModeState] = useState<ModeType>(
    () =>
      initialMode ??
      (typeof localStorage !== "undefined"
        ? (localStorage.getItem(localStorageConstants.QUESTION_CREATOR_MODE) as ModeType)
        : null) ??
      Mode.CARD
  );
  const [viewport, setViewportState] = useState<ViewPortType>(
    () =>
      initialViewport ??
      (typeof localStorage !== "undefined"
        ? (localStorage.getItem(localStorageConstants.QUESTION_CREATOR_VIEWPORT) as ViewPortType)
        : null) ??
      ViewPort.DESKTOP
  );
  const [theme, setThemeState] = useState<Theme | null>(initialTheme || null);

  const setMode = useCallback((newMode: ModeType) => {
    setModeState(newMode);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(localStorageConstants.QUESTION_CREATOR_MODE, newMode);
    }
  }, []);

  const setViewport = useCallback((newViewport: ViewPortType) => {
    setViewportState(newViewport);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(localStorageConstants.QUESTION_CREATOR_VIEWPORT, newViewport);
    }
  }, []);

  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [resetSubmissionStateFn, setResetSubmissionStateFn] = useState<(() => void) | null>(null);

  const isDefaultTheme = !theme || theme.name === "Default Theme" || theme.name === "Default";
  const effectiveTheme = previewTheme || theme;

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    onThemeChange?.(newTheme);
    // Clear preview theme when a new theme is selected
    setPreviewTheme(null);
  }, [onThemeChange]);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  const restart = useCallback(() => {
    onRestart?.();
  }, [onRestart]);

  const resetSubmissionState = useCallback(() => {
    resetSubmissionStateFn?.();
  }, [resetSubmissionStateFn]);

  const setResetSubmissionState = useCallback((fn: () => void) => {
    setResetSubmissionStateFn(() => fn);
  }, []);

  const escapeStack = useEscapeStack();
  const escapeLayerId = useId();

  useEffect(() => {
    escapeStack.register(escapeLayerId, close, 100);
    return () => {
      escapeStack.unregister(escapeLayerId);
    };
  }, [escapeStack, escapeLayerId, close]);

  return (
    <PreviewContext.Provider
      value={{
        mode,
        viewport,
        setMode,
        setViewport,
        restart,
        close,
        formName,
        onPublish,
        theme,
        previewTheme,
        effectiveTheme,
        isDefaultTheme,
        setTheme,
        setPreviewTheme,
        resetSubmissionState,
        setResetSubmissionState,
      }}
    >
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreviewContext() {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error("usePreviewContext must be used within PreviewProvider");
  }
  return context;
}
