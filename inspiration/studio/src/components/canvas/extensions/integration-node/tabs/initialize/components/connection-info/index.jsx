import { ASSETS } from "../../../../constant/assets";
import classes from "./index.module.css";
// import { ODSIcon } from '@src/module/ods';
import { ODSIcon } from "@src/module/ods";

const ConnectionInfo = ({ connectionSrc = "", integrationName = "" }) => {
  const displayName = integrationName || "this integration";

  return (
    <div
      className={classes["connection-info-root"]}
      data-testid="connection-info-root"
    >
      <div
        className={classes["connection-handshake-preview"]}
        data-testid="connection-handshake-preview"
      >
        <ODSIcon
          imageProps={{
            src: connectionSrc,
            alt: "connection-logo",
            className: `${classes["connection-logo"]}`,
          }}
          data-testid="connection-logo-icon"
        />

        <div
          className={classes["handshake-container"]}
          data-testid="handshake-container"
        >
          <ODSIcon
            outeIconName="OUTESwapHorizontal"
            outeIconProps={{
              sx: {
                width: "1.5rem",
                height: "1.5rem",
                fill: "#000",
              },
            }}
          />
        </div>
        <div className={classes["person"]} data-testid="person-icon">
          <ODSIcon
            imageProps={{
              src: ASSETS.INTEGRATION_NODE_LOGO,
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>
      <div className={classes["connection-text-container"]}>
        <p
          className={classes["connection-text-info"]}
          data-testid="connection-text-info"
        >
          Select the connection in which you want to do the required action.
        </p>
        <p
          className={classes["connection-description"]}
          data-testid="connection-description"
        >
          Securely link your accounts to enable automated workflows between{" "}
          {displayName} and Tiny Command.
        </p>
      </div>
    </div>
  );
};

export default ConnectionInfo;
