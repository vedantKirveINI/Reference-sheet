// import ODSLabel from "oute-ds-label";
import { ODSLabel } from "@src/module/ods";
import classes from "./form-field-wrapper.module.css";

export const FormFieldWrapper = ({
  heading,
  label,
  isRequired = false,
  flexDirection = "column",
  children,
}) => {
  const dataTestId = heading?.toLowerCase()?.replace(/\s+/g, "-");
  return (
    <div
      className={classes["custom-wrapper"]}
      style={{
        flexDirection: flexDirection,
      }}
    >
      <div className={classes["header"]}>
        <ODSLabel
          variant="h6"
          className={classes["heading"]}
          data-testid={`${dataTestId}-heading`}
          required={isRequired}
        >
          {heading}
        </ODSLabel>
        <ODSLabel
          variant="body2"
          className={classes["label"]}
          data-testid={`${dataTestId}-label`}
        >
          {label}
        </ODSLabel>
      </div>
      {children}
    </div>
  );
};
