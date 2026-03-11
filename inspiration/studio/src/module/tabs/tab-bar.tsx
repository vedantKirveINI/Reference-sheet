import { TabButton } from "./components/tab-button";

interface ITabs {
  label: string | number | React.ReactNode | React.JSX.Element;
  value: string | number;
}

export type TabBarProps = {
  selectedTab: string | number;
  tabs: ITabs[];
  onChange?: (value: ITabs) => void;
  tabStyles?: {
    containerStyle?: React.CSSProperties;
    tabStyle?: React.CSSProperties;
    selectedStyle?: React.CSSProperties;
  };
  testId?: string;
};

const TabBar = ({
  tabs = [],
  onChange,
  selectedTab,
  tabStyles = { containerStyle: {}, tabStyle: {}, selectedStyle: {} },
  testId = "mode",
}: TabBarProps) => {
  const isLabelIcon = typeof tabs[0].label === "object";
  return (
    <div
      style={{ display: "flex", fontSize: "13px", ...tabStyles.containerStyle }}
      data-testid={`${testId}-container`}
    >
      {tabs.map((tab, index) => {
        const isSelected = tab.value === selectedTab;
        return (
          <TabButton
            key={index}
            onClick={() => {
              onChange(tab);
            }}
            isSelected={isSelected}
            isIcon={isLabelIcon}
            styles={
              isSelected
                ? { ...tabStyles.tabStyle, ...tabStyles.selectedStyle }
                : tabStyles.tabStyle
            }
            testId={`${testId}-tab-${index}`}
          >
            {tab.label}
          </TabButton>
        );
      })}
    </div>
  );
};

export { TabBar };
