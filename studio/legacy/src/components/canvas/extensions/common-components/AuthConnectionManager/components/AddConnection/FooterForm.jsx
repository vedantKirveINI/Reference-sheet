import classes from "./index.module.css";
// import ODSButton from "oute-ds-button";
import { ODSButton } from "@src/module/ods";

const FooterForm = ({
  setShowAddConnection,
  name,
  onAddNewConnectionClickHandler = () => {},
}) => {
  return (
    <div className={classes["footer-container"]}>
      <ODSButton
        label="DISCARD"
        variant="black-text"
        onClick={() => {
          setShowAddConnection(false);
        }}
        // data-testid="add-connection-button"
        sx={{
          fontFamily: "Inter",
          fontSize: "1em",
          fontStyle: "normal",
          fontWeight: 600,
          padding: "1.3em 1em",
        }}
      />
      <ODSButton
        label="ADD CONNECTION"
        variant="black"
        onClick={onAddNewConnectionClickHandler}
        // data-testid="add-connection-button"
        sx={{
          fontFamily: "Inter",
          fontSize: "1em",
          fontStyle: "normal",
          fontWeight: 600,
          padding: "1.3em 1em",
        }}
        disabled={!name}
      />
    </div>
  );
};

export default FooterForm;
