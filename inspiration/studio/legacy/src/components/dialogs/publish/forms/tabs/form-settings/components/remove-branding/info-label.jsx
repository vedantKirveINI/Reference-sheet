// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "@src/module/ods";
import classes from "./index.module.css";

const InfoLabel = ({ message = "" }) => {
  return (
    <div className={classes["branding-info"]} data-testid="branding-info">
      <Icon
        outeIconName="OUTEInfoIcon"
        outeIconProps={{
          sx: { color: "#FB8C00", height: "1.5rem", width: "1.5rem" },
          "data-testid": "branding-info-icon",
        }}
      />

      <div
        data-testid={"branding-info-text"}
        className={classes["branding-info-text"]}
      >
        {message}
      </div>
    </div>
  );
};
export default InfoLabel;
