import classes from "./RadioGroupSection.module.css";
// import RadioGroup from "oute-ds-radio-group";
// import Radio from "oute-ds-radio";
import { ODSRadioGroup as RadioGroup, ODSRadio as Radio } from "@src/module/ods";
import InfoDisplay from "./InfoDisplay";

const radioStyles = {
  marginLeft: "-5px",
  marginRight: "16px",
  gap: "6px",
  "& .MuiRadio-root": {
    padding: "2px",
    // width: "19px",
    // height: "19px",
    // boxShadow:
    //   "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
    // backgroundColor: "#CFD8DC",
    // backgroundImage:
    //   "linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))",
    // color: "transparent",
  },
  // "& .MuiRadio-root.Mui-checked": {
  //   boxShadow: "inset 0 0 0 4px #2196F3",
  //   backgroundColor: "#fff",
  //   color: "transparent",
  // },
  // "& .MuiTouchRipple-root": {
  //   color: "#2196F3",
  // },
};

const RadioGroupSection = ({
  title = "",
  description = "",
  options = {},
  value = "",
  dataTestId = "",
  onValueChange = () => {},
}) => (
  <div
    className={classes["info-display-container"]}
    data-testid={
      dataTestId ? `${dataTestId}-radio-group-section` : "radio-group-section"
    }
  >
    <InfoDisplay title={title} description={description} />
    <RadioGroup
      value={value}
      onChange={(e, newValue) => onValueChange(newValue)}
      row
    >
      {Object.keys(options).map((key) => (
        <Radio
          key={options[key]}
          labelText={options[key]}
          formControlLabelProps={{
            value: options[key],
            sx: radioStyles,
          }}
          radioProps={{ "data-testid": options[key], disableRipple: false }}
          labelProps={{ variant: "body1" }}
        />
      ))}
    </RadioGroup>
  </div>
);

export default RadioGroupSection;
