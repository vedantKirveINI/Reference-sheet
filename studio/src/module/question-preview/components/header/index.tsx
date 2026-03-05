import React from "react";
import { ODSButton as Button } from "@src/module/ods";
import { TabBar } from "@src/module/tabs";
import { Mode, ViewPort } from "@oute/oute-ds.core.constants";
import ChevronLeft from "../../assets/icons/chevron-left";
import CodeIcon from "../../assets/icons/code-icon";
import ColorPalleteOutlinedIcon from "../../assets/icons/color-pallete-outline-icon";
import RestoreIcon from "../../assets/icons/restore-icon";
import UploadIcon from "../../assets/icons/upload-icon";
import DesktopIcon from "../../assets/icons/desktop-icon";
import MobileIcon from "../../assets/icons/mobile-icon";
import { getActionButtonStyles, getHeaderActionContainerStyles, getHeaderContainerStyles, getHeaderNamesContainerStyles, getHeaderTabsContainerStyles, getIconsStyles,  } from "./styles";

interface IHeaderProps {
  mode: string;
  onModeChange: React.Dispatch<React.SetStateAction<string>>;
  onClickBack: () => void;
  viewPort: string;
  onViewPortChange: React.Dispatch<React.SetStateAction<string>>;
  onRestart: () => void;
  handlePublishDialog?: () => void;
}

const Header = ({
  mode,
  onModeChange,
  onClickBack,
  onViewPortChange,
  viewPort,
  onRestart,
  handlePublishDialog,
}: IHeaderProps) => {
  return (
    <header style={getHeaderContainerStyles} data-testid="form-preview-header">
      <div style={getHeaderNamesContainerStyles}>
        <ChevronLeft
          style={{ ...getIconsStyles, cursor: "pointer" }}
          onClick={() => {
            if (onClickBack) {
              onClickBack();
            }
          }}
          data-testid="form-preview-back-button"
        />
        <TabBar
          selectedTab={viewPort}
          onChange={(tabData) => {
            onViewPortChange(tabData.value as string);
          }}
          tabs={[
            {
              label: <MobileIcon width="1.75em" height="1.75em" />,
              value: ViewPort.MOBILE,
            },
            {
              label: <DesktopIcon width="1.75em" height="1.75em" />,
              value: ViewPort.DESKTOP,
            },
          ]}
          tabStyles={{ tabStyle: { width: "3.5em", height: "3em" } }}
          testId="viewport"
        />
      </div>
      <div style={getHeaderTabsContainerStyles}>
        <TabBar
          selectedTab={mode}
          onChange={(tabData) => {
            onModeChange(tabData.value as string);
          }}
          tabs={[
            { label: "CARD", value: Mode.CARD },
            { label: "CLASSIC", value: Mode.CLASSIC },
            { label: "CHAT", value: Mode.CHAT },
          ]}
          tabStyles={{
            tabStyle: { width: "11.25em" },
          }}
          testId="mode"
        />
      </div>
      <div style={getHeaderActionContainerStyles}>
        {/* <CodeIcon width="1.75em" height="1.75em" />
        <ColorPalleteOutlinedIcon width="1.75em" height="1.75em" /> */}
        <Button
          label="RESTART"
          variant="black-outlined"
          size="small"
          startIcon={<RestoreIcon width="1.2em" height="1.2em" />}
          style={{
            ...getActionButtonStyles,
            backgroundColor: "transparent",
          }}
          onClick={() => {
            onRestart();
          }}
          data-testid="restart-button"
        />

        <Button
          label="PUBLISH"
          variant="black"
          size="small"
          startIcon={<UploadIcon width="1.2em" height="1.2em" />}
          style={getActionButtonStyles}
          onClick={handlePublishDialog}
          data-testid="publish-button"
        />
      </div>
    </header>
  );
};

export default Header;
