import React, { useState } from "react";
import { ODSLabel } from "@src/module/ods";
import InputMask from "react-input-mask";
import { ODSAutocomplete as ODSAutoComplete } from "@src/module/ods";
import { styles } from "./styles";
interface TimeSettingsProps {
  value?: any;
  question?: any;
  setQuestion?: any;
  onChange?: ({ time, meridiem, timeZone, ISOValue }: any) => void;
  viewPort?: any;
  style?: any;
}

const DefaultTime = ({
  viewPort,
  question,
  onChange,
  style = {},
  value,
}: TimeSettingsProps) => {
  const settings = question?.settings;
  const [timeValue, setTimeValue] = useState({
    time: "",
    meridiem: "AM",
    ...value,
  });
  //to get timezone
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZoneName: "short",
  };
  const timeWithZone = date.toLocaleString(undefined, options);
  const timeZone = timeWithZone?.split(" ").pop();

  const handleTimeChange = ({ _time, _meridiem }) => {
    let ISOValue = "";
    if (_time?.length === 5 && _meridiem !== "") {
      const [hours, minutes] = _time.split(":").map(Number);
      let hours24 = hours;

      //converting to 24 hour format
      if (_meridiem === "PM" && hours !== 12) {
        hours24 = hours + 12;
      } else if (_meridiem === "AM" && hours === 12) {
        hours24 = 0; // Midnight case (12 AM is 00:00 in 24-hour format)
      }

      const currentDate = new Date();
      currentDate.setHours(hours24, minutes, 0, 0);
      ISOValue = currentDate.toISOString();
    }

    onChange({
      time: _time,
      meridiem: _meridiem,
      timeZone: timeZone,
      ISOValue: ISOValue,
    });
  };

  return (
    <div
      style={styles.container(style.containerStyle)}
      data-testid="settings-default-time"
    >
      <ODSLabel variant="body1">Default Time</ODSLabel>
      <div style={styles.inputContainer(style.inputStyle)}>
        <InputMask
          placeholder="HH:MM"
          mask="99:99"
          maskChar={null}
          style={styles.inputStyle}
          value={timeValue?.time}
          onChange={(e) => {
            handleTimeChange({
              _time: e.target.value,
              _meridiem: timeValue?.meridiem,
            });
            setTimeValue({ ...timeValue, time: e.target.value });
          }}
          data-testid="settings-default-time-input"
        />
        {!settings?.isTwentyFourHour && (
          <ODSAutoComplete
            disabled={settings?.isTwentyFourHour}
            options={["AM", "PM"]}
            value={timeValue?.meridiem}
            getOptionLabel={(option) => {
              return option;
            }}
            isOptionEqualToValue={(option, value) => {
              return option === value;
            }}
            onChange={(event, newValue) => {
              handleTimeChange({
                _time: timeValue.time,
                _meridiem: newValue,
              });
              setTimeValue({ ...timeValue, meridiem: newValue });
            }}
            ListboxProps={{
              "data-testid": "settings-default-time-meridiem-listbox",
            }}
            textFieldProps={{
              size: "small",
              inputProps: {
                "data-testid": "settings-default-time-meridiem-input",
              },
            }}
            
            data-testid="settings-default-time-meridiem-autocomplete"
          />
        )}
      </div>

      {settings?.errors?.defaultTimeError && (
        <ODSLabel
          variant="body1"
          color="error"
          data-testid="settings-default-time-error"
          style={{ position: "absolute", bottom: "-2em" }}
        >
          {settings?.errors?.defaultTimeError}
        </ODSLabel>
      )}
    </div>
  );
};

export default DefaultTime;
