import React from "react";
// import Autocomplete from "oute-ds-autocomplete";
// import Icon from "oute-ds-icon";
import { ODSAutocomplete as Autocomplete, ODSIcon as Icon } from "@src/module/ods";
import { TRIGGER_TYPES } from "../constants/trigger-types";

const TriggerTypeAutocomplete = ({ triggerType, onChange = () => {} }) => {
  return (
    <Autocomplete
      variant="black"
      options={TRIGGER_TYPES}
      fullWidth
      value={TRIGGER_TYPES?.find((t) => t?.type === triggerType) || null}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <li {...rest} key={key} style={{ display: "flex", gap: "0.5rem" }}>
            <div
              style={{
                padding: "0.25rem",
                borderRadius: "50%",
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                imageProps={{
                  src: option._src,
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
      onChange={(e, value) => {
        onChange(value);
      }}
      data-testid="select-trigger-dropdown"
    />
  );
};

export default TriggerTypeAutocomplete;
