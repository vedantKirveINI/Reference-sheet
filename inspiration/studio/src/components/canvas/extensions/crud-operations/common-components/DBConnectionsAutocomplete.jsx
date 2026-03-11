import React, { useState } from "react";
import { ODSAutocomplete as Autocomplete, ODSLabel as Label } from "@src/module/ods";

const DBConnectionsAutocomplete = ({
  connections = [],
  onChange = () => {},
  connection,
  label = "Select Connection",
  description = "",
}) => {
  const [selectedConnection, setSelectedConnection] = useState(connection);
  const changeHandler = (e, connection) => {
    setSelectedConnection(connection);
    onChange(e, connection);
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
          options={connections}
          getOptionLabel={(option) => option?.name}
          onChange={changeHandler}
          isOptionEqualToValue={(option, value) => {
            return option?._id === value?._id;
          }}
          size="medium"
          disableClearable={false}
          textFieldProps={{
            placeholder: "Select a connection",
            autoFocus: true,
          }}
          value={selectedConnection}
        />
      </div>
    </div>
  );
};

export default DBConnectionsAutocomplete;
