import React from "react";
import { ODSIcon as Icon } from "@src/module/ods";
import classes from "./index.module.css";
const ParamsTitle = ({ title }) => {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
        <Icon
          outeIconName="OUTEGlobeIcon"
          outeIconProps={{
            sx: {
              color: "var(--primary-500)",
              width: 24,
              height: 24,
              cursor: "pointer"
            },
          }}
        />
        <span className={classes["params-title"]}>{title}</span>
      </div>
    </>
  );
};

export default ParamsTitle;
