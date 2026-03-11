// import { ODSIcon } from "@src/module/ods";
// import { ODSButton } from "@src/module/ods";
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
        
        fullWidth
      />
    </div>
  );
};

export default AddConnectionBar;
