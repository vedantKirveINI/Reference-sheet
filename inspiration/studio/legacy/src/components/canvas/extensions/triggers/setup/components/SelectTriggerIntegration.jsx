import React from "react";
// import Autocomplete from "oute-ds-autocomplete";
// import Label from "oute-ds-label";
// import Icon from "oute-ds-icon";
import { ODSAutocomplete as Autocomplete, ODSLabel as Label, ODSIcon as Icon } from "@src/module/ods";

const SelectTriggerIntegration = ({
  selectedIntegration,
  selectedEvent,
  onChange = () => {},
}) => {
  const triggerOptions =
    selectedIntegration?.events?.filter?.(
      (item) => item.annotation === "TRIGGER"
    ) || [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
      <Label variant="body1">Trigger Type</Label>
      <Autocomplete
        options={triggerOptions}
        value={selectedEvent}
        getOptionLabel={(option) => option?.name || ""}
        data-testid="app-based-trigger-type-dropdown"
        textFieldProps={{
          autoFocus: selectedIntegration && !selectedEvent,
          placeholder: "Select trigger type",
          InputProps: {
            endAdornment: <Icon outeIconName="OUTESearchIcon" />,
          },
        }}
        searchable
        openOnFocus
        variant="black"
        fullWidth
        sx={{ "& .MuiOutlinedInput-root": { paddingRight: "1rem !important" } }}
        renderOption={(props, option) => {
          return (
            <li
              {...props}
              key={option?._id}
              style={{ display: "flex", gap: "0.5rem" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                <Label
                  variant="body1"
                  color={props["aria-selected"] ? "#fff" : "#212121"}
                >
                  {option.name}
                </Label>
                {!!option?.description && (
                  <Label
                    variant="body2"
                    color={props["aria-selected"] ? "#fff" : "#607D8B"}
                  >
                    {option?.description}
                  </Label>
                )}
              </div>
            </li>
          );
        }}
        onChange={(e, value) => {
          onChange(value);
        }}
      />
    </div>
  );
};

export default SelectTriggerIntegration;
