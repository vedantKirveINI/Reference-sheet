// import { ODSTextField } from '@src/module/ods';
// import { ODSButton } from '@src/module/ods';
import { ODSTextField, ODSButton } from "@src/module/ods";
import { useState } from "react";
import classes from "./index.module.css";

const AddAssetId = ({ onSave, defaultAssetId }) => {
  const [assetId, setAssetId] = useState(defaultAssetId || "");

  return (
    <div className={classes["add-asset-container"]}>
      <ODSTextField
        className={"black"}
        value={assetId}
        placeholder={`Enter asset id`}
        fullWidth={true}
        onChange={(e) => {
          setAssetId(e.target.value);
        }}
        data-testid="asset-id-input"
      />

      <ODSButton
        label="Save"
        variant="black"
        onClick={() => onSave(assetId)}
        size="large"
        className={classes["button"]}
        data-testid="asset-id-save-button"
      />
    </div>
  );
};

export default AddAssetId;
