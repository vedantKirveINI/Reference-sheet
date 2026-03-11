import classes from "./publish-title.module.css";
// import ODSLabel from "oute-ds-label";
import { ODSLabel } from "@src/module/ods";

export const PublishTitle = ({ title }) => {
  return (
    <div
      className={classes["publish-title-container"]}
      data-testid="publish-title-container"
    >
      <img
        className={classes["publish-title-icon"]}
        src="https://cdn-v1.tinycommand.com/1234567890/1755676180432/Component%20Icon.svg"
      />
      <ODSLabel
        variant="h5"
        data-testid="publish-title-text"
        sx={{
          maxWidth: "40rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >{`Publish ${title}`}</ODSLabel>
    </div>
  );
};
