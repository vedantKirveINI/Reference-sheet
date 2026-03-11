import { useEffect, useRef, useState } from "react";
// import Label from "oute-ds-label";
// import Textfield from "oute-ds-text-field";
// import ODSAutocomplete from "oute-ds-autocomplete";
import { ODSLabel as Label, ODSTextField as Textfield, ODSAutocomplete } from "@src/module/ods";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import classes from "./Configure.module.css";

import { RUN_SCENARIO_OPTIONS } from "../../../constants/trigger-constants";

const Configure = ({
  runScenario,
  minutes,
  startDate,
  endDate,
  handleOnChange,
  handleDateChange,
  errors,
}) => {
  const containerRef = useRef(null);

  const getError = (text) =>
    errors?.find((e) => e.toLowerCase().includes(text.toLowerCase()));

  const [isOpen, setIsOpen] = useState({
    startDate: false,
    endDate: false,
  });

  const handleClickOutside = (event) => {
    const isClickInsideStart =
      containerRef.current && containerRef.current.contains(event.target);
    const isClickInsidePopper = event.target.closest('[role="dialog"]');

    if (!isClickInsideStart && !isClickInsidePopper) {
      setIsOpen({
        startDate: false,
        endDate: false,
      });
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={classes["time-based-trigger-container"]}
      data-testid="time-based-trigger-container"
    >
      <div
        className={classes["time-based-trigger-label-field-container"]}
        data-testid="time-based-trigger-run-scenario-container"
      >
        <Label variant="h6" color={"#000"} data-testid="run-scenario-label">
          Run Scenario<sup className={classes["required"]}>*</sup>
        </Label>
        <Label
          variant="body1"
          color={"#607d8b"}
          data-testid="run-scenario-description-label"
        >
          Select how often you want the scenario to run.
        </Label>
        <ODSAutocomplete
          options={RUN_SCENARIO_OPTIONS}
          value={runScenario}
          onChange={(e, value) => handleOnChange("runScenario", value)}
          renderInput={(params) => (
            <Textfield
              {...params}
              placeholder="Select folder"
              className="black"
            />
          )}
          variant="black"
          sx={{
            width: "100%",

            "& .MuiInputBase-root": {
              padding: "0rem 0.5rem",
            },
            input: {
              height: "2.75rem",
              fontSize: "1.1rem",
            },
          }}
          data-testid="time-based-trigger-run-scenario-dropdown"
        />
      </div>

      <div
        className={classes["time-based-trigger-label-field-container"]}
        data-testid="time-based-trigger-minutes-container"
      >
        <Label variant="h6" color={"#000"} data-testid="minutes-label">
          Minutes<sup className={classes["required"]}>*</sup>
        </Label>
        <Label
          variant="body1"
          color={"#607d8b"}
          data-testid="minutes-description-label"
        >
          The time interval in which the scenario should be repeated (In
          Minutes).
        </Label>
        <Textfield
          required
          value={minutes}
          className="black"
          onChange={(e) => {
            if (isNaN(e.target.value)) return;
            handleOnChange("minutes", e.target.value);
          }}
          type="number"
          sx={{
            "& .MuiInputBase-root": {
              padding: "0rem 0.5rem",
            },
          }}
          InputProps={{
            placeholder: "Enter time interval",
            sx: {
              input: {
                height: "2.75rem",
                fontSize: "1.1rem",
              },
            },
            "data-testid": "time-based-trigger-minutes-input",
          }}
        />
        {getError("Please enter a positive interval") && (
          <Label
            variant="body1"
            color={"#ff0000"}
            data-testid="time-based-trigger-minutes-error-label"
          >
            {getError("Please enter a positive interval")}
          </Label>
        )}
      </div>

      <div
        className={classes["time-based-trigger-label-field-container"]}
        data-testid="time-based-trigger-start-date-container"
        ref={containerRef}
      >
        <Label variant="h6" color={"#000"} data-testid="start-date-label">
          Start
        </Label>
        <Label
          variant="body1"
          color={"#607d8b"}
          data-testid="start-date-description-label"
        >
          Fill in only if you want the scenario to be run from a specific date.
        </Label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            open={isOpen.startDate}
            onOpen={() => setIsOpen({ ...isOpen, startDate: true })}
            onClose={() => setIsOpen({ ...isOpen, startDate: false })}
            value={startDate}
            onChange={(newValue) => handleDateChange(newValue, "startDate")}
            sx={{
              input: {
                height: "2.75rem",
                fontSize: "1.2rem",
                padding: "0rem 0.5rem",
              },
            }}
            slotProps={{
              textField: {
                InputProps: {
                  "data-testid": "time-based-trigger-start-date-input",
                },
              },
            }}
          />
        </LocalizationProvider>
        {getError("Start date cannot be after End date") && (
          <Label
            variant="body1"
            color={"#ff0000"}
            data-testid="time-based-trigger-start-date-error-label"
          >
            {getError("Start date cannot be after End date")}
          </Label>
        )}
      </div>

      <div
        className={classes["time-based-trigger-label-field-container"]}
        data-testid="time-based-trigger-end-date-container"
      >
        <Label variant="h6" color={"#000"} data-testid="end-date-label">
          End
        </Label>
        <Label
          variant="body1"
          color={"#607d8b"}
          data-testid="end-date-description-label"
        >
          Fill in only if you want the scenario to be run until a specific date.
        </Label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            disabled={!startDate}
            open={isOpen.endDate}
            onOpen={() => setIsOpen({ ...isOpen, endDate: true })}
            onClose={() => setIsOpen({ ...isOpen, endDate: false })}
            value={endDate}
            shouldDisableDate={(date) => {
              return startDate ? date.isBefore(startDate, "day") : false;
            }}
            onChange={(newValue) => handleDateChange(newValue, "endDate")}
            sx={{
              input: {
                height: "2.75rem",
                fontSize: "1.2rem",
                padding: "0rem 0.5rem",
              },
            }}
            slotProps={{
              textField: {
                InputProps: {
                  "data-testid": "time-based-trigger-end-date-input",
                },
              },
            }}
          />
        </LocalizationProvider>
        {getError("End date cannot be before Start date") && (
          <Label
            variant="body1"
            color="#ff0000"
            data-testid="time-based-trigger-end-date-error-label"
          >
            {getError("End date cannot be before Start date")}
          </Label>
        )}
      </div>
    </div>
  );
};

export default Configure;
