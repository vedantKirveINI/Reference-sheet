import React, { useEffect, useRef } from "react";
// import Autocomplete from "oute-ds-autocomplete";
// import Icon from "oute-ds-icon";
// import Label from "oute-ds-label";
import { ODSAutocomplete as Autocomplete, ODSIcon as Icon, ODSLabel as Label } from "@src/module/ods";
const SelectIntegration = ({
  integrations,
  integration,
  onChange = () => {},
}) => {
  const selectAppRef = useRef();
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!integration) {
        selectAppRef.current.focus();
      }
    }, 500);
    return () => {
      clearTimeout(timeout);
    };
  }, [integration]);
  return (
    <div style={{ display: "flex", gap: ".5rem", flexDirection: "column" }}>
      <Label variant="body1">Select App</Label>
      <Autocomplete
        options={integrations}
        variant="black"
        fullWidth
        value={integration ?? null}
        data-testid="app-based-trigger-select-app-dropdown"
        onChange={(e, value) => {
          onChange(value);
        }}
        textFieldProps={{
          placeholder: "Select an app",
          InputProps: {
            endAdornment: <Icon outeIconName="OUTESearchIcon" />,
          },
          inputRef: selectAppRef,
        }}
        sx={{ "& .MuiOutlinedInput-root": { paddingRight: "1rem !important" } }}
        searchable
        openOnFocus
        getOptionLabel={(option) => option.name}
        renderOption={(props, option) => {
          return (
            <li
              {...props}
              key={option?._id}
              style={{ display: "flex", gap: "0.5rem" }}
            >
              <div
                style={{
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "1.5rem",
                  height: "1.5rem",
                }}
              >
                <Icon
                  imageProps={{
                    src: option.meta?.thumbnail,
                    style: {
                      width: "1.5rem",
                      height: "1.5rem",
                    },
                  }}
                />
              </div>
              {option.name}
            </li>
          );
        }}
      />
    </div>
  );
};

export default SelectIntegration;
