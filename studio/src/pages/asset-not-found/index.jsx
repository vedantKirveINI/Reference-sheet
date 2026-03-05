import React from "react";
// import { ODSLabel } from '@src/module/ods';
// import { ODSButton } from '@src/module/ods';
// import { ODSIcon } from '@src/module/ods';
import images from "../../assets/images";
import classes from "./index.module.css";
// import { serverConfig } from '@src/module/ods';
import { ODSLabel, ODSButton, ODSIcon, serverConfig } from "@src/module/ods";

const AssetNotFound = () => {
  return (
    <>
      <div className={classes["asset-not-found-gradient"]} />
      <div className={classes["asset-not-found-container"]}>
        <div className={classes["asset-not-found-header"]}>
          <ODSIcon
            outeIconName="TINY"
            outeIconProps={{
              sx: {
                width: "auto",
                height: "30px",
              },
            }}
            onClick={() => {
              // navigate("/");
            }}
          />
        </div>
        <div className={classes["asset-not-found-content"]}>
          <ODSIcon imageProps={{ src: images.assetNotFound }} />
          <ODSLabel variant="h4">File does not exist.</ODSLabel>
          <ODSLabel variant="p">
            Please ensure that you have the correct URL and that the file has
            not been deleted by the owner.
          </ODSLabel>
          <ODSButton
            label="Back To Home"
            variant="text"
            onClick={() => {
              window.location.href = serverConfig.WC_LANDING_URL;
            }}
          />
        </div>
      </div>
    </>
  );
};

export default AssetNotFound;
