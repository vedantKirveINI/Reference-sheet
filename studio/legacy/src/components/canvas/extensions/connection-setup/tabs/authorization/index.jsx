import React from "react";
// import ODSAutoComplete from "oute-ds-autocomplete";
// import ODSButton from "oute-ds-button";
// import ODSIcon from "oute-ds-icon";
// import TextField from "oute-ds-text-field";
// import ODSCircularProgress from "oute-ds-circular-progress";
import { ODSAutocomplete as ODSAutoComplete, ODSButton, ODSIcon, ODSTextField as TextField, ODSCircularProgress } from "@src/module/ods";
import commonClasses from "../common.module.css";

const BUTTON_OPTION = { name: "Authorization", type: "BUTTON" };

export const AuthorizationTab = ({
  selectedConnection,
  setSelectedConnection,
  authorizations = [],
  loading,
  setShowAddAuthorizationDialog,
  setQuestionHandler,
}) => {
  return (
    <div
      className={[
        commonClasses["tabs-settings-container"],
        commonClasses["tabs-container-padding"],
      ].join(" ")}
    >
      <h2
        aria-label="Authorization Label"
        className={commonClasses["tabs-autocomplete-label"]}
      >
        Authorization
      </h2>
      <ODSAutoComplete
        id="asynchronous-demo"
        value={selectedConnection}
        searchable={false}
        onChange={(e, newValue) => {
          setSelectedConnection(newValue);
          setQuestionHandler("authorization", newValue);
        }}
        isOptionEqualToValue={(option, _value) => option.name === _value.name}
        getOptionLabel={(option) => option?.name || ""}
        options={[...authorizations, BUTTON_OPTION]}
        loading={loading}
        sx={{
          width: "100%",
        }}
        ListboxProps={{
          sx: {
            padding: "8px",
            maxHeight: "20vh !important",
            display: "flex",
            flexDirection: "column",
            gap: "0.5em",
          },
        }}
        renderOption={(props = {}, option) => {
          // React 18 warning which states key can't be spread in JSX
          // https://github.com/facebook/react/pull/25697
          const { key = "", ...restProps } = props;

          return (
            <li
              key={key}
              {...restProps}
              className={`${option?.type === "BUTTON" ? "" : restProps?.className || ""}`}
              style={{
                listStyle: "none",
              }}
            >
              {option?.type === "BUTTON" ? (
                <ODSButton
                  onClick={() => setShowAddAuthorizationDialog(true)}
                  variant="text"
                  sx={{
                    width: "max-content",
                    height: "100%",
                    color: "#2196F3",
                    fontFamily: "Inter",
                    fontSize: "0.875em",
                    fontStyle: "normal",
                    fontWeight: 600,
                    lineHeight: "2.25em",
                    letterSpacing: "0.078125em",
                    textTransform: "uppercase !important",
                    justifyContent: "flex-start",
                    gap: "0.5em",
                    alignItems: "center",
                    padding: "0.5em 0.75em",
                  }}
                  startIcon={<ODSIcon outeIconName="OUTEAddIcon" />}
                >
                  {option?.name}
                </ODSButton>
              ) : (
                <span>{option?.name}</span>
              )}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Select Authorization"
            sx={{
              "& .MuiInputBase-root": {
                padding: "9px !important",
              },
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <ODSCircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </div>
  );
};
