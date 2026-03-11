// import Autocomplete from "oute-ds-autocomplete";
// import ODSCheckbox from "oute-ds-checkbox";
// import ODSLabel from "oute-ds-label";
import { ODSAutocomplete as Autocomplete, ODSCheckbox, ODSLabel } from "@src/module/ods";

const OPTIONS = ["Create Record", "Update Record", "Delete Record"];

const EventTypeAutoComplete = ({
  eventType,
  onEventTypeChange,
  label,
  description,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <ODSLabel variant="h6">{label}</ODSLabel>

      <ODSLabel variant="subtitle1" color="#607D8B">
        {description}
      </ODSLabel>

      <Autocomplete
        multiple
        variant="black"
        options={OPTIONS}
        data-testid="select-event"
        onChange={onEventTypeChange}
        value={eventType}
        fullWidth
        renderOption={(props, option) => {
          const { key, ...rest } = props;
          const isSelected = eventType.some((val) => {
            return val === option;
          });

          return (
            <li key={key} {...rest}>
              <ODSCheckbox
                sx={{
                  "&.Mui-checked": {
                    color: "white",
                  },
                }}
                labelText={option}
                checked={isSelected}
                labelProps={{
                  variant: "subtitle1",
                  sx: {
                    color: "inherit",
                  },
                }}
              />
            </li>
          );
        }}
        textFieldProps={{
          placeholder: "Select event",
        }}
      />
    </div>
  );
};

export default EventTypeAutoComplete;
