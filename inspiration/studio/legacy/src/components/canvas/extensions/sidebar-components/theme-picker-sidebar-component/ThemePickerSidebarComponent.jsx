import React, { useMemo, useState } from "react";
import { CustomTheme, DefaultTheme } from "@oute/oute-ds.atom.theme-manager";
import TabContainer from "../../common-components/TabContainer";

const ThemePickerSidebarComponent = ({
  theme,
  forground,
  dark,
  light,
  onThemeChange = () => {},
  handleSetTheme = () => {},
  projectId,
  workspaceId,
}) => {
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const onThemeSelect = (_theme) => {
    setSelectedTheme(_theme);
    onThemeChange(_theme);
  };

  const themeTabs = useMemo(() => {
    return [
      {
        label: "DEFAULT THEME",
        panelComponent: DefaultTheme,
        panelComponentProps: {
          selectedTheme,
          onThemeSelect,
          handleSetTheme,
          projectId,
          workspaceId,
        },
      },
      {
        label: "CUSTOM THEME",
        panelComponent: CustomTheme,
        panelComponentProps: {
          selectedTheme: selectedTheme,
          onThemeSelect,
          handleSetTheme,
          projectId,
          workspaceId,
        },
      },
    ];
  }, [selectedTheme, projectId, workspaceId]);

  return (
    <TabContainer
      tabs={themeTabs || []}
      colorPalette={{
        foreground: forground || "#fff", //nodeData.foreground,
        dark: dark || "#FD5D2D",
        light: light || "#F09A19",
      }}
      onTabSwitch={() => handleSetTheme(selectedTheme)}
      data-testid="theme-manager-tabs"
    />
  );
};

export default ThemePickerSidebarComponent;
