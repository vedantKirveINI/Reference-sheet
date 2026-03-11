import classes from "./view-option.module.css";
// import ODSLabel from "oute-ds-label";
// import Icon from "oute-ds-icon";
// import ODSToolTip from "oute-ds-tooltip";
import { ODSLabel, ODSIcon as Icon, ODSTooltip as ODSToolTip } from "@src/module/ods";

export const ViewOption = ({ mode, isSelected, isPublished, onViewChange }) => {
  const formattedMode = mode.charAt(0) + mode.slice(1).toLowerCase();

  return (
    <ODSToolTip
      title={
        !isPublished && !isSelected
          ? "Please publish the form to allow switching to this view"
          : ""
      }
      arrow={false}
    >
      <div
        className={`${classes.viewOption} ${isSelected ? classes.selected : ""} ${!isPublished ? classes.disabled : ""}`}
        onClick={isPublished ? () => onViewChange(mode) : null}
        data-testid={`view-option-${mode.toLowerCase()}`}
      >
        <div className={classes.viewIconContainer}>
          <Icon
            outeIconName={`${formattedMode}ViewIcon`}
            outeIconProps={{
              "data-testid": `${mode.toLowerCase()}-view-icon`,
              sx: {
                color: "#000",
                height: "3rem",
                width: "3rem",
              },
            }}
          />
        </div>
        <ODSLabel
          variant="caption"
          children={formattedMode}
          sx={{ color: "inherit" }}
        />
      </div>
    </ODSToolTip>
  );
};
