import { useCallback, useMemo } from "react";
import { FormulaBar } from "@src/module/ods";
import { ODSTextField } from "@src/module/ods";
import { ODSLabel } from "@src/module/ods";
import { ODSSwitch as Switch } from "@src/module/ods";
import { ODSAutocomplete } from "@src/module/ods";
import {
  getMainContainerStyles,
  getInputWrapperStyles,
  getSwitchWrapper,
  getLabelStyles,
  dynamicLabelStyles,
  hintText,
} from "./styles";
import { IQuestionDataProps } from "../../index";
import { useTinyTableFields } from "./hooks/useTinyTableFields";

const DropdownData = ({
  question,
  onChange,
  variables,
}: IQuestionDataProps) => {
  const settings = question?.settings;
  const dynamicValues = settings?.dynamicInputs;

  const { fieldOptions, hasTinyTableSource } = useTinyTableFields({
    blocks: dynamicValues?.variable?.blocks || [],
    variables: variables || {},
  });

  const onSettingsChange = useCallback(
    (key: string, value: any) => {
      onChange({
        settings: {
          ...question?.settings,
          [key]: value,
        },
      });
    },
    [onChange, question]
  );

  const onDynamicValueChange = useCallback(
    (key: string, value: any) => {
      onSettingsChange("dynamicInputs", {
        ...dynamicValues,
        [key]: value,
      });
    },
    [dynamicValues, onSettingsChange]
  );

  const autocompleteOptions = useMemo(() => {
    return fieldOptions.map((field) => ({
      value: field.id,
      label: field.label,
    }));
  }, [fieldOptions]);

  const getSelectedOption = (accessor: string) => {
    if (!accessor) return null;
    return autocompleteOptions.find((opt) => opt.value === accessor) || null;
  };

  return (
    <div style={getMainContainerStyles()} data-testid="dropdown-data-container">
      <div style={getInputWrapperStyles()} data-testid="dropdown-data-wrapper">
        <div style={dynamicLabelStyles()} data-testid="source-list-wrapper">
          <ODSLabel
            variant="body1"
            data-testid="dropdown-data-source-list-label"
          >
            Source List (Array)
          </ODSLabel>
          <FormulaBar
            isReadOnly={false}
            hideInputBorders={false}
            defaultInputContent={dynamicValues?.variable?.blocks}
            onInputContentChanged={(content) => {
              onDynamicValueChange("variable", {
                type: "fx",
                blocks: content,
              });
            }}
            wrapContent={true}
            variables={variables}
            slotProps={{
              container: {
                "data-testid": "dropdown-data-source-list-formula-bar",
              },
            }}
          />
          <span style={hintText} data-testid="source-list-hint">
            Select a variable that contains your dropdown items. This should be
            an array from earlier in your flow.
          </span>
        </div>

        <div style={dynamicLabelStyles()} data-testid="id-accessor-wrapper">
          <ODSLabel
            variant="body1"
            data-testid="dropdown-data-id-accessor-label"
          >
            ID Value Accessor
          </ODSLabel>
          {hasTinyTableSource && fieldOptions.length > 0 ? (
            <ODSAutocomplete
              options={autocompleteOptions}
              value={getSelectedOption(dynamicValues?.idAccessor)}
              onChange={(_, newValue) => {
                onDynamicValueChange("idAccessor", newValue?.value || "");
              }}
              getOptionLabel={(option) => option?.label || ""}
              isOptionEqualToValue={(option, value) =>
                option?.value === value?.value
              }
              renderInput={(params) => (
                <ODSTextField
                  {...params}
                  className="black"
                  fullWidth
                  placeholder="Select a field"
                  data-testid="dropdown-data-id-accessor-autocomplete"
                />
              )}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#1a1a1a",
                  color: "#fff",
                },
              }}
            />
          ) : (
            <ODSTextField
              className="black"
              fullWidth
              value={dynamicValues?.idAccessor}
              onChange={(e) =>
                onDynamicValueChange("idAccessor", e?.target?.value)
              }
              name="idAccessor"
              data-testid="dropdown-data-id-accessor"
            />
          )}
          <span style={hintText} data-testid="id-accessor-hint">
            {hasTinyTableSource && fieldOptions.length > 0
              ? "Select the field that should be used as the unique ID for dropdown items."
              : "Choose the field name that should be used as id for dropdown list. Please make sure this have unique value."}
          </span>
        </div>

        <div style={dynamicLabelStyles()} data-testid="label-accessor-wrapper">
          <ODSLabel
            variant="body1"
            data-testid="dropdown-data-label-accessor-label"
          >
            Option Value Accessor
          </ODSLabel>
          {hasTinyTableSource && fieldOptions.length > 0 ? (
            <ODSAutocomplete
              options={autocompleteOptions}
              value={getSelectedOption(dynamicValues?.labelAccessor)}
              onChange={(_, newValue) => {
                onDynamicValueChange("labelAccessor", newValue?.value || "");
              }}
              getOptionLabel={(option) => option?.label || ""}
              isOptionEqualToValue={(option, value) =>
                option?.value === value?.value
              }
              renderInput={(params) => (
                <ODSTextField
                  {...params}
                  className="black"
                  fullWidth
                  placeholder="Select a field"
                  data-testid="dropdown-data-label-accessor-autocomplete"
                />
              )}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#1a1a1a",
                  color: "#fff",
                },
              }}
            />
          ) : (
            <ODSTextField
              className="black"
              fullWidth
              value={dynamicValues?.labelAccessor}
              onChange={(e) => {
                onDynamicValueChange("labelAccessor", e?.target?.value);
              }}
              name="labelAccessor"
              data-testid="dropdown-data-label-accessor"
            />
          )}
          <span style={hintText} data-testid="label-accessor-hint">
            {hasTinyTableSource && fieldOptions.length > 0
              ? "Select the field that should be displayed as the label in the dropdown list."
              : "Choose the field name that should be displayed in the dropdown list. Please make sure this have unique value."}
          </span>
        </div>

        <div style={getSwitchWrapper} data-testid="map-object-switch-wrapper">
          <Switch
            checked={dynamicValues?.mapObjectItems}
            onChange={() =>
              onDynamicValueChange(
                "mapObjectItems",
                !dynamicValues?.mapObjectItems
              )
            }
            data-testid="dropdown-data-map-object-switch"
            style={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: "#FFF" },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#000",
              },
            }}
            variant="black"
          />
          <span style={getLabelStyles} data-testid="map-object-label">
            Reference Object items
          </span>
        </div>
        <span style={hintText} data-testid="map-object-hint">
          Turn ON to make the full object available for future use (not just the
          selected ID). Ideal if you need more details like price, email, or
          category later in the flow. When ON, the whole object is passed to
          your workflow instead of just the ID.
        </span>
      </div>
    </div>
  );
};

export default DropdownData;
