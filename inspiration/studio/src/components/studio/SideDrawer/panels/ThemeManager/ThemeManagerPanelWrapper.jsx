import React, { useState, useEffect, useCallback } from "react";
import ThemeManagerBody from "./ThemeManagerBody";
import { themeSDKServices } from "@/module/panels/ThemeManager";
import { TEMPLATE_LIBRARY_THEMES } from "@/module/constants/formThemeConstants";
import { themeToLegacyShape } from "@/module/panels/ThemeManager/utils/themeShapeUtils";

const ThemeManagerPanelWrapper = ({
  theme,
  projectId,
  workspaceId,
  handleSetTheme = () => {},
  onThemeChange = () => {},
}) => {
  const [allThemes, setAllThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllThemes = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const themes = await themeSDKServices.list({ workspace_id: workspaceId });
      setAllThemes(themes || []);
    } catch (error) {
      setAllThemes([]);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchAllThemes();
  }, [fetchAllThemes]);

  const templateThemes = TEMPLATE_LIBRARY_THEMES;
  const userThemes = allThemes || [];

  const handleThemeChange = useCallback((updatedTheme) => {
    const legacy = themeToLegacyShape(updatedTheme);
    handleSetTheme(legacy);
    onThemeChange(legacy);
  }, [handleSetTheme, onThemeChange]);

  const handleSaveTheme = useCallback(async (themeToSave) => {
    if (!themeToSave) return;
    const legacy = themeToLegacyShape(themeToSave);
    const themeData = {
      ...legacy,
      workspace_id: workspaceId,
      project_id: projectId,
      name: legacy.name || `Custom Theme ${Date.now()}`,
    };
    if (!legacy._id && !legacy.id) {
      themeData._id = undefined;
      themeData.id = undefined;
    }

    const savedTheme = await themeSDKServices.save(themeData);
    if (!savedTheme) {
      throw new Error("Failed to save theme");
    }
    await fetchAllThemes();
    handleThemeChange(themeToLegacyShape(savedTheme));
    return savedTheme;
  }, [workspaceId, projectId, fetchAllThemes, handleThemeChange]);

  const handleDeleteTheme = useCallback(async (themeToDelete) => {
    if (!themeToDelete?._id) return;
    
    const success = await themeSDKServices.delete(themeToDelete._id);
    if (success) {
      await fetchAllThemes();
    }
  }, [fetchAllThemes]);

  return (
    <ThemeManagerBody
      theme={theme}
      onChange={handleThemeChange}
      templateThemes={templateThemes}
      userThemes={userThemes}
      onSaveTheme={handleSaveTheme}
      onDeleteTheme={handleDeleteTheme}
      isLoading={isLoading}
    />
  );
};

export default ThemeManagerPanelWrapper;
