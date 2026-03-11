import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "workflow-preferences";

const DEFAULT_PREFERENCES = {
  autoSaveOnClose: true,
  showRecentNodes: true,
  autoRunTests: false,
};

export const useWorkflowPreferences = () => {
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (e) {
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
    }
  }, [preferences]);

  const updatePreference = useCallback((key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const toggleAutoSaveOnClose = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      autoSaveOnClose: !prev.autoSaveOnClose,
    }));
  }, []);

  const toggleShowRecentNodes = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      showRecentNodes: !prev.showRecentNodes,
    }));
  }, []);

  const toggleAutoRunTests = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      autoRunTests: !prev.autoRunTests,
    }));
  }, []);

  return {
    preferences,
    updatePreference,
    resetPreferences,
    toggleAutoSaveOnClose,
    toggleShowRecentNodes,
    toggleAutoRunTests,
  };
};

export const getWorkflowPreferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (e) {
  }
  return DEFAULT_PREFERENCES;
};

export { DEFAULT_PREFERENCES };
