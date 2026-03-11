import React from "react";
import ODSLabel from "oute-ds-label";
import ODSRadioGroup from "oute-ds-radio-group";
import DBConnectionItem from "./DBConnectionItem";

const DBConnectionList = ({
  connections = [],
  selectedConnectionId,
  onChange = () => {},
}) => {
  const getIsSelectedStatus = (connection) => {
    const connectionId = connection?._id || connection?.connection_id;
    return selectedConnectionId === connectionId;
  };

  if (connections.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        paddingTop: "1rem",
        borderTop: "0.75px solid #cfd8dc",
      }}
      data-testid="db-connection-list-container"
    >
      <ODSLabel
        data-testid="db-existing-connections-title"
        variant="sub-heading-1"
      >
        Existing Connections
      </ODSLabel>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: "0.75rem",
          overflowY: "auto",
          overflowX: "hidden",
          maxHeight: "40vh",
          padding: "0.5rem 0 1rem 0",
        }}
        data-testid="db-connections-list"
      >
        <ODSRadioGroup
          row={true}
          value={selectedConnectionId || ""}
          className="black"
          sx={{
            width: "100%",
            display: "grid",
            gap: "0.5rem",
            "& .MuiFormControlLabel-root": {
              marginRight: 0,
            },
            "&.Mui-checked": {
              color: "black !important",
            },
          }}
          data-testid="db-connections-list-radio-group"
          onChange={(e) => {
            const connection = connections.find(
              (conn) => conn._id === e.target.value
            );
            if (connection) {
              onChange(connection);
            }
          }}
        >
          {connections.map((connection) => {
            return (
              <DBConnectionItem
                key={connection._id || connection.connection_id}
                connection={connection}
                isSelected={getIsSelectedStatus(connection)}
              />
            );
          })}
        </ODSRadioGroup>
      </div>
    </div>
  );
};

export default DBConnectionList;
