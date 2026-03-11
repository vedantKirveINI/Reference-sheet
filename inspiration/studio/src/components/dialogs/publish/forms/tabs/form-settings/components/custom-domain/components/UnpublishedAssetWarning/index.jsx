// import { ODSIcon } from "@src/module/ods";
// import { ODSLabel } from "@src/module/ods";
import { ODSIcon, ODSLabel } from "@src/module/ods";
import classes from "./index.module.css";
const UnpublishedAssetWarning = () => {
  return (
    <div className={classes.warningContainer}>
      <ODSIcon
        outeIconName="OUTEWarningIcon"
        outeIconProps={{
          sx: {
            color: "#FB8C00",
            width: "1.25rem",
            height: "1.25rem",
          },
        }}
      />
      <ODSLabel
        variant="body2"
        style={{
          fontFamily: "Inter",
          fontWeight: 500,
        }}
      >
        Form should be published once to use custom domain
      </ODSLabel>
    </div>
  );
};

export default UnpublishedAssetWarning;
