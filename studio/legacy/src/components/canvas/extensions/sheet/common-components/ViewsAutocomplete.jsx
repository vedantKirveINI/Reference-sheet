import React from "react";
// import Autocomplete from "oute-ds-autocomplete";
// import ODSLabel from "oute-ds-label";
import { ODSAutocomplete as Autocomplete, ODSLabel } from "@src/module/ods";

const ViewsAutocomplete = ({
  views,
  disabled = false,
  onChange = () => {},
  view,
  searchable = false,
  label = "Please Select a Sheet",
  description = "",
  autocompleteProps = {},
}) => {
  const changeHandler = (e, view) => {
    onChange(e, view);
  };
  return (
    <div>
      <ODSLabel variant="h6" fontWeight="600" required data-testid="view-label">
        {label}
      </ODSLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75em" }}>
        <ODSLabel
          variant="subtitle1"
          color="#607D8B"
          data-testid="view-description"
        >
          {description}
        </ODSLabel>

        <Autocomplete
          fullWidth
          variant="black"
          options={views}
          getOptionLabel={(view) => view?.name}
          onChange={changeHandler}
          disableClearable={false}
          searchable={searchable}
          isOptionEqualToValue={(option, value) => {
            return option?.id === value?.id;
          }}
          data-testid="select-view"
          disabled={disabled}
          textFieldProps={{
            placeholder: "Select a view",
            ...(!label ? { label: "View" } : {}),
          }}
          value={view}
          loading={views.length === 0}
          {...autocompleteProps}
          renderOption={(props, option) => {
            return (
              <li {...props} key={props?.id} data-testid="view-option">
                <span>{option?.name}</span>
              </li>
            );
          }}
        />
      </div>
    </div>
  );
};

export default ViewsAutocomplete;
