import React from "react";
import { ODSRadio } from "@src/module/ods";
import classes from "./DBConnectionItem.module.css";
import dayjs from "dayjs";

const DBConnectionItem = ({ connection, isSelected }) => {
  const createdDate = connection?.created_at
    ? dayjs(connection.created_at).format("MMM DD, YYYY")
    : "Unknown";

  return (
    <div
      className={`${classes.connection_item_container} ${
        isSelected ? classes.selected : ""
      }`}
      data-testid="db-connection-item"
    >
      <ODSRadio
        data-testid="db-connection-radio"
        formControlLabelProps={{
          value: connection?._id || connection?.connection_id,
          checked: isSelected,
          sx: {
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            width: "100%",

            "& .MuiRadio-root": {
              padding: "1px 9px",
              "&.Mui-checked": {
                color: "#212121",
              },
            },
            "& .MuiTypography-root": {
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
            },
          },
        }}
        className={classes.radio}
        labelText={connection?.name}
        labelProps={{
          variant: "body1",
        }}
      />

      <div
        className={classes.connection_dates}
        data-testid="db-connection-date-display"
      >
        <div className={classes.date_item}>Created {createdDate}</div>
      </div>
    </div>
  );
};

export default DBConnectionItem;
