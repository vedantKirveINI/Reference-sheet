import React from "react";
// import ODSLabel from "oute-ds-label";
// import ODSButton from "oute-ds-button";
import classes from "./index.module.css";
// import { serverConfig } from "oute-ds-utils";
import { ODSLabel, ODSButton, serverConfig } from "@src/module/ods";

const ResourceNotFound = () => {
  return (
    <div className={classes["resource-not-found-container"]}>
      <div className={classes["resource-not-found-content"]}>
        <ODSLabel variant="h2">404</ODSLabel>
        <ODSLabel variant="h6">
          Sorry, the file that you've requested has been deleted.
        </ODSLabel>
        <ODSLabel variant="p">
          Make sure that you have the correct URL and that the owner of the file
          hasn't deleted it.
        </ODSLabel>
        <ODSButton
          label="Back To Home"
          variant="outlined"
          onClick={() => {
            window.location.href = serverConfig.WC_LANDING_URL;
          }}
        />
      </div>
    </div>
  );
};

export default ResourceNotFound;
