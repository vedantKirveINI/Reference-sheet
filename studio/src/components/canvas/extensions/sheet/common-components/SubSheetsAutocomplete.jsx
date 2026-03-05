import React from "react";
// import { ODSAutocomplete as Autocomplete } from "@src/module/ods";
// import { ODSLabel } from '@src/module/ods';
import { ODSAutocomplete as Autocomplete, ODSLabel } from "@src/module/ods";

const SubSheetsAutocomplete = ({
  subSheets,
  disabled = false,
  onChange = () => {},
  table,
  searchable = false,
  autocompleteProps = {},
  label = "Please Select a Sheet",
  description = "",
}) => {
  const changeHandler = (e, schema) => {
    onChange(e, schema);
  };

  return (
    <div>
      <ODSLabel
        variant="h6"
        fontWeight="600"
        required
        data-testid="table-label"
      >
        {label}
      </ODSLabel>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75em" }}>
        <ODSLabel
          variant="subtitle1"
          color="#607D8B"
          data-testid="table-description"
        >
          {description}
        </ODSLabel>

        <Autocomplete
          fullWidth
          variant="black"
          options={subSheets}
          getOptionLabel={(schema) => schema?.name}
          onChange={changeHandler}
          disableClearable={false}
          searchable={searchable}
          isOptionEqualToValue={(option, value) => {
            return option?.id === value?.id;
          }}
          data-testid="select-table"
          disabled={disabled}
          textFieldProps={{
            placeholder: "Select a table",
            ...(!label ? { label: "Table" } : {}),
          }}
          value={table}
          loading={subSheets?.length === 0}
          {...autocompleteProps}
          renderOption={(props, option) => {
            return (
              <li {...props} key={props?.id} data-testid="table-option">
                <span>{option?.name}</span>
              </li>
            );
          }}
        />
      </div>
    </div>
  );
};

export default SubSheetsAutocomplete;
