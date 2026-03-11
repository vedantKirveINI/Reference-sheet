// import ODSLabel from "oute-ds-label";
// import Icon from "oute-ds-icon";
// import ODSToolTip from "oute-ds-tooltip";
import { ODSLabel, ODSIcon as Icon, ODSTooltip as ODSToolTip } from "@src/module/ods";
import classes from "./share-option.module.css";

const ShareOption = ({
  iconName,
  label,
  onClick,
  disabled = false,
  iconColor,
  dataTestId,
}) => {
  return (
    <ODSToolTip
      title={disabled ? "Please publish the form to share" : ""}
      arrow={false}
    >
      <div
        className={`${classes.shareOption} ${disabled ? classes.disabled : ""}`}
        onClick={!disabled ? onClick : () => {}}
        data-testid={dataTestId ? `${dataTestId}-container` : ""}
      >
        <Icon
          outeIconName={iconName}
          outeIconProps={{
            "data-testid": dataTestId ? `${dataTestId}-icon` : "",
            sx: {
              height: "2.25rem",
              width: "2.25rem",
              ...(iconColor ? { color: iconColor } : {}),
            },
          }}
        />
        <ODSLabel
          variant="caption"
          children={label}
          data-testid={dataTestId ? `${dataTestId}-label` : ""}
        />
      </div>
    </ODSToolTip>
  );
};

export default ShareOption;
