// import ODSIcon from "oute-ds-icon";
// import ODSButton from "oute-ds-button";
import { ODSIcon, ODSButton } from "@src/module/ods";
import classes from "./index.module.css";

const AddConnectionBar = ({ setShowAddConnection }) => {
  return (
    <div className={classes["add-connection-bar"]}>
      <ODSButton
        data-testid="add-connection-button"
        label="ADD CONNECTION"
        variant="black"
        onClick={() => {
          setShowAddConnection(true);
        }}
        startIcon={
          <ODSIcon
            data-testid="add-connection-icon"
            outeIconName={"OUTEAddIcon"}
            outeIconProps={{
              sx: {
                color: "#fff",
                width: "1.25rem",
                height: "1.25rem",
              },
            }}
          />
        }
        sx={{
          height: "3rem",
          fontFamily: "Inter",
          fontSize: "0.9375rem",
          fontStyle: "normal",
          fontWeight: 600,
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-1px)",
          },
        }}
        fullWidth
      />
    </div>
  );
};

export default AddConnectionBar;
