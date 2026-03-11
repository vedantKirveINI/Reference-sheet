import React from "react";
import { ODSAutocomplete as Autocomplete, ODSLabel as Label } from "@src/module/ods";

const DBSchemasAutocomplete = ({
  schemas,
  disabled = false,
  onChange = () => {},
  schema,
  label = "Select Table",
  description = "",
  searchable = false,
}) => {
  const changeHandler = (e, schema) => {
    onChange(e, schema);
  };
  return (
    <div>
      <Label variant="h6" fontWeight="600" required>
        {label}
      </Label>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75em" }}>
        <Label variant="subtitle1" color="#607D8B">
          {description}
        </Label>
        <Autocomplete
          fullWidth
          variant="black"
          options={schemas}
          getOptionLabel={(schema) => schema?.name}
          onChange={changeHandler}
          disableClearable={false}
          searchable={searchable}
          isOptionEqualToValue={(option, value) => {
            return option?._id === value?.table_id;
          }}
          size="medium"
          disabled={disabled}
          textFieldProps={{
            placeholder: "Select a table",
          }}
          value={schema}
        />
      </div>
    </div>
  );
};

export default DBSchemasAutocomplete;
