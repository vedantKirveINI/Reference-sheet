import {
  Mode,
  SUBMISSION_STATES,
  ViewPort,
} from "@oute/oute-ds.core.constants";
import classes from "./index.module.css";
import ODSAutocomplete from "oute-ds-autocomplete";
import ODSIcon from "oute-ds-icon";
import Button from "oute-ds-button";

const Header = ({
  mode,
  viewPort,
  setMode,
  setViewPort,
  onClose,
  onRestart,
  setSubmissionState,
}) => {
  return (
    <div className={classes["header"]}>
      <div onClick={onClose} className={classes["back"]}>
        <ODSIcon
          outeIconName={"OUTEArrowBackIcon"}
          outeIconProps={{
            sx: {
              color: "#212121",
            },
          }}
        />
        Back to canvas
      </div>
      <div className={classes["actions"]}>
        <Button
          label="RESTART"
          variant="black-outlined"
          startIcon={
            <img
              src="https://cdn-v1.tinycommand.com/1234567890/1755693586567/restoreIcon.svg"
              style={{
                height: "1.5rem",
                width: "1.5rem",
              }}
            />
          }
          sx={{
            height: "auto",
            border: "1px solid rgba(0, 0, 0, 0.23)",
          }}
          onClick={() => {
            onRestart();
          }}
          data-testid="restart-button"
        />
        <ODSAutocomplete
          value={viewPort}
          options={[ViewPort.MOBILE, ViewPort.DESKTOP]}
          searchable={false}
          selectOnFocus={false}
          popupIcon={
            <ODSIcon
              outeIconName="OUTEExpandMoreIcon"
              outeIconProps={
                {
                  // "data-testid": "ArrowDropDownIcon",
                  // sx: { color: "#fff" },
                }
              }
            />
          }
          sx={{ width: "auto", minWidth: "12rem" }}
          textFieldProps={{
            sx: {
              "& .MuiInputBase-root": {
                // background: "#212121",
                // width: "10rem",
              },
              ".MuiOutlinedInput-input": {
                fontWeight: 600,
                // color: "#fff !important",
              },
            },
            inputProps: {
              cursor: "default !important",
            },
          }}
          variant="black"
          onChange={(e, value) => {
            setViewPort(value);
          }}
        />
        <ODSAutocomplete
          value={mode}
          options={[Mode.CARD, Mode.CLASSIC, Mode.CHAT]}
          searchable={false}
          selectOnFocus={false}
          sx={{ width: "auto", minWidth: "8rem" }}
          popupIcon={
            <ODSIcon
              outeIconName="OUTEExpandMoreIcon"
              outeIconProps={{
                // "data-testid": "ArrowDropDownIcon",
                sx: { color: "#fff" },
              }}
            />
          }
          textFieldProps={{
            sx: {
              "& .MuiInputBase-root": {
                background: "#212121",
                width: "8rem",
                fontWeight: 600,
              },
              ".MuiOutlinedInput-input": {
                color: "#fff !important",
              },
            },
            inputProps: {
              cursor: "default !important",
            },
          }}
          variant="black"
          onChange={(e, value) => {
            setSubmissionState(SUBMISSION_STATES.IDLE);
            setMode(value);
          }}
        />
      </div>
    </div>
  );
};
export default Header;
