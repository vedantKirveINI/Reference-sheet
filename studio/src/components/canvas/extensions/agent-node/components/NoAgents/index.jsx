import classes from "./index.module.css";
// import { ODSIcon } from '@src/module/ods';
import { ODSIcon } from "@src/module/ods";

const NoAgentsPreview = () => {
  return (
    <div
      className={classes["no-connection-preview-root"]}
      data-testid="no-connection-preview-root"
    >
      <div className={classes["no-connection-image-container"]}>
        <ODSIcon
          outeIconName={"OUTEConnectionIcon"}
          outeIconProps={{
            sx: {
              width: "3.04231rem",
              height: "3.04231rem",
              fill: "#607D8B",
            },
          }}
          data-testid={"no-connection-icon"}
        />
      </div>
      <p
        className={classes["preview-title"]}
        data-testid="no-connection-preview-title"
      >
        No Agents available
      </p>
    </div>
  );
};

export default NoAgentsPreview;
