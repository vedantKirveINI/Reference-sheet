import React from "react";
// import Autocomplete from "oute-ds-autocomplete";
// import Icon from "oute-ds-icon";
import { ODSAutocomplete as Autocomplete, ODSIcon as Icon } from "@src/module/ods";
import { useState } from "react";

const JumpToAutocomplete = ({
  options = [],
  disabledOptions = [],
  selectedOption,
  onChange = () => {},
}) => {
  const [value, setValue] = useState(selectedOption);
  return (
    <Autocomplete
      options={options}
      textFieldProps={{
        size: "small",
        placeholder: "Select a node",
        InputProps: {
          startAdornment: value?._src ? (
            <Icon
              imageProps={{
                src: value?._src,
                width: 32,
                height: 32,
                style: { border: "1px solid #E4E5E8", borderRadius: "50%" },
              }}
            />
          ) : null,
        },
      }}
      isOptionEqualToValue={(option, value) => option.key === value.key}
      getOptionLabel={(option) => `${option.name} ${option.description}`}
      getOptionDisabled={(option) => disabledOptions?.includes(option.key)}
      renderOption={(props, option) => (
        <li {...props}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "40px",
              gap: "0.5rem",
            }}
          >
            <Icon
              imageProps={{
                src: option?._src,
                width: 32,
                height: 32,
                style: { border: "1px solid #E4E5E8", borderRadius: "50%" },
              }}
            />
            {`${option.name} ${option.description}`}
          </div>
        </li>
      )}
      onChange={(e, value) => {
        setValue(value);
        onChange(value);
      }}
      value={value}
      disableClearable={false}
    />
  );
};

export default JumpToAutocomplete;
