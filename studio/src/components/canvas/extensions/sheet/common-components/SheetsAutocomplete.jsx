// import { ODSLabel } from '@src/module/ods';
// import { ODSAutocomplete as Autocomplete } from "@src/module/ods";
import { ODSLabel, ODSAutocomplete as Autocomplete, ODSIcon as Icon } from "@src/module/ods";
import { useState } from "react";
// import { ODSIcon as Icon } from '@src/module/ods';

const SheetsAutocomplete = ({
  sheets = [],
  onChange = () => {},
  sheet,
  autocompleteProps = {},
  label = "Please Select a Sheet",
  description = "",
  getSheetList = () => {},
  createSheet = () => {},
}) => {
  const [selectedSheet, setSelectedSheet] = useState(sheet);
  const [isRotating, setIsRotating] = useState(false);

  const changeHandler = (e, sheet) => {
    if (sheet?.isCustomOption) {
      createSheet();
      return;
    }

    setSelectedSheet(sheet);
    onChange(e, sheet);
  };

  const handleSyncClick = () => {
    setIsRotating(true);
    getSheetList();

    setTimeout(() => setIsRotating(false), 1000);
  };

  return (
    <div>
      <ODSLabel
        variant="h6"
        fontWeight="600"
        required
        data-testid="sheet-label"
      >
        {label}
      </ODSLabel>
      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.75em" }}
        data-testid="sheet-description"
      >
        <ODSLabel variant="subtitle1" color="#607D8B">
          {description}
        </ODSLabel>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Autocomplete
            fullWidth
            variant="black"
            options={[
              { name: "Create New Sheet", isCustomOption: true },
              ...sheets,
            ]}
            searchable={true}
            getOptionLabel={(option) => option?.name}
            onChange={changeHandler}
            isOptionEqualToValue={(option, value) => {
              const optionId = option?._id || option?.id;
              const valueId = value?._id || value?.id;
              return optionId === valueId;
            }}
            disableClearable={false}
            textFieldProps={{
              placeholder: "Select a sheet",
              autoFocus: true,
              ...(!label ? { label: "Sheet" } : {}),
            }}
            data-testid="select-sheet"
            value={selectedSheet}
            loading={sheets?.length === 0}
            {...autocompleteProps}
            ListboxProps={{
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "0.375rem",
              },
              sx: {
                "& .MuiAutocomplete-option": {
                  minHeight: "fit-content !important",
                },
                padding: "0.375rem",
              },
            }}
            renderOption={(props, option, state) => {
              const selected = state?.selected ?? false;
              const formattedDate = option?.edited_at
                ? new Date(option.edited_at).toLocaleString("en-IN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "—";

              if (option?.isCustomOption) {
                return (
                  <li
                    {...props}
                    key={props?.id}
                    data-testid="create-new-sheet-option"
                    style={{
                      ...props?.style,
                      flexShrink: 0,
                      display: "flex",
                      gap: "0.275rem",
                    }}
                  >
                    <Icon
                      outeIconName="OUTEAddIcon"
                      outeIconProps={{
                        sx: { color: "#212121" },
                      }}
                    />
                    <b>{option?.name}</b>
                  </li>
                );
              }

              return (
                <li
                  {...props}
                  key={props?.id}
                  data-testid="sheet-option"
                  style={{ ...props?.style, flexShrink: 0 }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      width: "100%",
                      gap: "0.275rem",
                    }}
                  >
                    <ODSLabel
                      variant="body1"
                      color={selected ? "#fff" : "inherit"}
                    >
                      {option?.name}
                    </ODSLabel>
                    <ODSLabel
                      variant="subtitle2"
                      color={selected ? "#fff" : "#607D8B"}
                    >
                      Last updated: {formattedDate}
                    </ODSLabel>
                  </div>
                </li>
              );
            }}
          />

          <div
            style={{
              cursor: "pointer",
              border: "1px solid #333",
              borderRadius: "4px",
              padding: "0.45rem",
            }}
          >
            <Icon
              outeIconName="OUTESyncIcon"
              outeIconProps={{
                sx: {
                  color: "#212121",
                  transform: isRotating ? "rotate(-360deg)" : "rotate(0deg)",
                  transition: isRotating ? "transform 1s ease-in-out" : "none",
                },
              }}
              buttonProps={{
                "data-testid": "sheet-refresh-button",
              }}
              onClick={handleSyncClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SheetsAutocomplete;
