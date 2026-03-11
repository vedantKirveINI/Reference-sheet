// import Switch from "oute-ds-switch";
// import ODSLabel from "oute-ds-label";
import { ODSSwitch as Switch, ODSLabel } from "@src/module/ods";
import classes from "./index.module.css";

const FormSwitch = ({
  id,
  label,
  description,
  isChecked,
  onChange,
  children,
  dataTestId,
}) => {
  return (
    <div
      className={classes.mainContainer}
      data-testid={dataTestId ? `${dataTestId}-container` : ""}
    >
      <div className={classes.switchContainer}>
        <Switch
          variant="black"
          id={id}
          checked={isChecked}
          onChange={onChange}
          className={classes.switch}
          data-testid={dataTestId ? `${dataTestId}-switch` : ""}
        />
        <div className={classes.switchInfo}>
          <ODSLabel
            variant="body1"
            children={label}
            data-testid={dataTestId ? `${dataTestId}-label` : ""}
            sx={{ fontWeight: 500, cursor: "pointer", width: "max-content" }}
            onClick={onChange}
          />
          {description && (
            <ODSLabel
              variant="body2"
              children={description}
              data-testid={dataTestId ? `${dataTestId}-description` : ""}
              sx={{ color: "#607D8B", cursor: "pointer" }}
              onClick={onChange}
            />
          )}
        </div>
      </div>

      {isChecked && children && (
        <div
          className={classes.childrenContainer}
          data-testid={dataTestId ? `${dataTestId}-content` : ""}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default FormSwitch;
