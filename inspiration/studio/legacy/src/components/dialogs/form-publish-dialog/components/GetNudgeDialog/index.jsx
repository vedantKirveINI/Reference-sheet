import classes from "./index.module.css";
import SelectTheme from "../../../../SelectTheme";
import RemoveBranding from "../../../../RemoveBranding";

const GetNudgeDialog = ({
  isDefaultTheme,
  showRemoveBranding,
  onClick,
  viewPort,
}) => {
  let content = null;

  if (isDefaultTheme) {
    content = <SelectTheme onClick={onClick} viewPort={viewPort} />;
  } else if (showRemoveBranding) {
    content = <RemoveBranding onClick={onClick} viewPort={viewPort} />;
  }

  return <div className={classes["nudge-dialog"]}>{content}</div>;
};

export default GetNudgeDialog;
