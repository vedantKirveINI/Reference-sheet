import React from "react";
import { getIconTabButtonContainer, getTabButtonContainer } from "./styles";
export interface TabButtonTypes {
  isSelected: boolean;
  children: React.ReactNode;
  onClick: () => void;
  isIcon?: boolean;
  styles?: React.CSSProperties;
  testId?: string;
}
export const TabButton = (props: TabButtonTypes) => {
  const {
    isSelected,
    children,
    onClick,
    isIcon = false,
    styles = {},
    testId = "tabs",
  } = props;
  return (
    <div
      style={{
        ...(
          isIcon
            ? getIconTabButtonContainer({ isSelected })
            : getTabButtonContainer({ isSelected })
        ),
        ...styles
      }}
      onClick={onClick}
      aria-label={isSelected ? "selected" : "unselected"}
      data-testid={testId}
    >
      {children}
    </div>
  );
};
