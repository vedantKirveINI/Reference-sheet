import _ from "lodash";
import { ODSAutocomplete as ODSAutoComplete, ODSChip as Chip, ODSCheckbox } from "@src/module/ods";
import { autoCompleteStyles } from "./styles";
interface AutoCompleteProps {
  options?: any;
  viewPort?: string;
  isCreator?: boolean;
  multiple?: boolean;
  placeholder?: string;
  onChange?: any;
  value?: any;
  disabled?: boolean;
  isInputValid?: boolean;
  isIntegration?: boolean;
  theme?: any;
  dataTestId?: string;
}

const AutoComplete = ({
  options,
  multiple = false,
  onChange,
  value,
  disabled,
  dataTestId,
}: AutoCompleteProps) => {
  const getValue = () => {
    if (!_.isEmpty(value)) return value;
    return multiple ? [] : null;
  };

  const getLabel = (opt) => {
    return typeof opt === "string" ? opt : opt?.label;
  };

  const getId = (opt) => {
    return typeof opt === "string" ? opt : opt?.id;
  };

  return (
    <div
      data-testid={
        dataTestId
          ? dataTestId + "-autocomplete-root"
          : "dropdown-autocomplete-root"
      }
    >
      <ODSAutoComplete
        variant="black"
        fullWidth
        disabled={disabled}
        disableCloseOnSelect={multiple}
        multiple={multiple}
        options={options}
        searchable
        value={getValue()}
        disableClearable={multiple ? true : false}
        ListboxProps={{
          sx: autoCompleteStyles.autocomplete.listbox,
          // "data-testid": dataTestId
          //   ? dataTestId + "-autocomplete-listbox"
          //   : "dropdown-autocomplete-listbox",
        }}
        getOptionLabel={(option) => getLabel(option) || ""}
        isOptionEqualToValue={(option, _value) =>
          getId(option) == getId(_value)
        }
        onChange={(e, data) => {
          if (multiple) {
            onChange(data, _, { executeNode: false });
          } else {
            onChange(data, _, { executeNode: true });
          }
        }}
        renderTags={(tagValue, getTagProps) => {
          return (
            <>
              {tagValue?.map?.((option, index) => (
                <Chip
                  label={getLabel(option)}
                  style={autoCompleteStyles.autocomplete.chip}
                  {...getTagProps({ index })}
                  key={index}
                />
              ))}
            </>
          );
        }}
        renderOption={(props, option) => (
          <li
            {...props}
            key={option?.id}
            // data-testid={
            //   dataTestId
            //     ? dataTestId + "-autocomplete-option"
            //     : "dropdown-autocomplete-option"
            // }
          >
            {multiple && (
              <ODSCheckbox
                id="input-checkbox"
                
                style={{ marginRight: "0.75em" }}
                checked={Boolean(
                  value?.map?.((val) => getId(val))?.includes?.(getId(option))
                )}
                // data-testid={
                //   dataTestId
                //     ? dataTestId + "-autocomplete-checkbox"
                //     : "dropdown-autocomplete-checkbox"
                // }
              />
            )}
            <span>{getLabel(option)}</span>
          </li>
        )}
        data-testid={dataTestId ? dataTestId : "dropdown-autocomplete"}
        data-node-type={"dropdown"}
      />
    </div>
  );
};

export default AutoComplete;
