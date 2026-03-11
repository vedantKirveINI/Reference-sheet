import React, { useMemo } from "react";
import Textfield from "oute-ds-text-field";
import ODSAutocomplete from "oute-ds-autocomplete";
import ODSLabel from "oute-ds-label";
import { DATE_FIELD_TYPES } from "../constants.js";
import styles from "./DateFieldSelector.module.css";

const DateFieldSelector = ({ table, dateField, onDateFieldChange }) => {
  const dateFields = useMemo(() => {
    if (!table?.fields) return [];

    return table.fields.filter((field) => {
      const fieldType =
        field?.type?.toLowerCase() || field?.dataType?.toLowerCase() || "";
      return DATE_FIELD_TYPES.some((type) =>
        fieldType.includes(type.toLowerCase())
      );
    });
  }, [table]);

  const handleChange = (_, newValue) => {
    onDateFieldChange(newValue);
  };

  const isDisabled = !table || dateFields.length === 0;

  const getDescription = () => {
    if (!table) return "Select a table first to see available date fields";
    if (dateFields.length === 0) return "No date fields found in this table";
    return "Select the date/datetime field to monitor for this trigger.";
  };

  return (
    <div>
      <ODSLabel variant="h6" fontWeight="600" required>
        Select Date Field
      </ODSLabel>

      <div className={styles.contentWrapper}>
        <ODSLabel variant="subtitle1" color="#607D8B">
          {getDescription()}
        </ODSLabel>

        <ODSAutocomplete
          options={dateFields}
          value={dateField}
          onChange={handleChange}
          disabled={isDisabled}
          getOptionLabel={(option) => option?.name || option?.label || ""}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          renderInput={(params) => (
            <Textfield
              {...params}
              className="black"
              placeholder={
                isDisabled ? "No date fields available" : "Select a date field"
              }
            />
          )}
          sx={{
            width: "100%",
            "& .MuiInputBase-root": {
              padding: "0 0.5rem",
            },
            input: {
              height: "2.5rem",
              fontSize: "0.9375rem",
            },
          }}
        />
      </div>
    </div>
  );
};

export default DateFieldSelector;
