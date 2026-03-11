import classes from "./index.module.css";
// import ODSIcon from "oute-ds-icon";
// import ToggleButtonGroup from "oute-ds-toggle-button-group";
import { Mode, ViewPort } from "../../../../../../module/constants";
// import ODSAutoComplete from "oute-ds-autocomplete";
// import ODSButton from "oute-ds-button";
// import ODSToggleButton from "oute-ds-toggle-button";
import { ODSIcon, ODSToggleButtonGroup as ToggleButtonGroup, ODSAutocomplete as ODSAutoComplete, ODSButton, ODSToggleButton } from "@src/module/ods";

const viewPorts = [
  { type: ViewPort.DESKTOP, icon: "OUTEDesktopIcon" },
  { type: ViewPort.MOBILE, icon: "OUTEMobileIcon" },
];
const modes = [Mode.CARD, Mode.CHAT]; //, Mode.CLASSIC
const Footer = ({
  mode,
  onModeChange,
  viewPort,
  onViewPortChange,
  onSave = () => {},
  onDiscard = () => {},
}) => {
  return (
    <footer className={classes["footer-container"]} data-testid="footer">
      <div className={classes["footer-line"]}></div>
      <div
        className={classes["footer-left-container"]}
        data-testid="mode-selector-container"
      >
        <ODSAutoComplete
          variant="black"
          selectOnFocus={false}
          sx={{
            width: "10.25em",
            "& .MuiInputBase-root": {
              height: "2.75em",
              cursor: "pointer",
            },
            "& .MuiInputBase-input": {
              cursor: "pointer !important",
            },
          }}
          slotProps={{
            paper: {
              sx: {
                marginBottom: "0.5em",
              },
            },
          }}
          data-testid={`footer-mode-selector`}
          options={modes}
          value={mode}
          disablePortal={true}
          onChange={(event, newValue) => {
            onModeChange(newValue);
          }}
        />

        <ToggleButtonGroup
          value={viewPort}
          exclusive
          onChange={(event, newValue) => {
            if (newValue) {
              onViewPortChange(newValue);
            }
          }}
          aria-label="viewport toggle"
          sx={{
            height: "2.75em",
          }}
          data-testid="footer-viewport-selector"
        >
          {viewPorts.map(({ type, icon }) => (
            <ODSToggleButton
              key={type}
              value={type}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#212121 !important",
                },
              }}
              data-testid={`footer-${type.toLowerCase()}-button`}
            >
              <ODSIcon
                outeIconName={icon}
                data-testid={`footer-${type.toLowerCase()}icon`}
                outeIconProps={{
                  "data-testid": `footer-${type.toLowerCase()}-icon`,
                  sx: {
                    fill: viewPort === type ? "#FFF" : "#212121",
                  },
                }}
              />
            </ODSToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      <div
        className={classes["footer-right-container"]}
        data-testid="footer-right-container"
      >
        {/* <ODSButton
          label="DISCARD"
          variant="black-outlined"
          onClick={onDiscard}
          data-testid="save-button"
          sx={{
            width: "7.5rem",
            height: "2.75rem",
          }}
        /> */}
        <ODSButton
          label="CLOSE"
          variant="black"
          onClick={onSave}
          size="large"
          data-testid="footer-close-button"
        />
      </div>
    </footer>
  );
};

export default Footer;
