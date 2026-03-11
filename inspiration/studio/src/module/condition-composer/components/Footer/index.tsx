import React from "react";
import { ODSIcon, ODSButton } from "@src/module/ods";
import { default_theme } from "@src/module/ods";
import { getFooterContainerStyles } from "./styles";
import { addChildByAccessor } from "../../utils/fieldOperations";
const Footer = ({ schema, rootValues, onChangeHandler }: any) => {
  const addCndHandler = ({ isGroup }) => {
    const newObj = { ...rootValues };
    addChildByAccessor(newObj, "", isGroup, schema);

    onChangeHandler(newObj);
  };

  return (
    <div style={getFooterContainerStyles()}>
      <ODSButton
        variant="black-text"
        size="large"
        label="ADD CONDITION"
        onClick={() => addCndHandler({ isGroup: false })}
        className="text-sm"
        data-testid="filter-add-condition-btn"
        startIcon={
          <ODSIcon
            outeIconName="OUTEAddIcon"
            outeIconProps={{
              style: {
                height: 18,
                width: 18,
                color: "#212121",
              },
            }}
          />
        }
      />

      <ODSButton
        variant="black-text"
        size="large"
        label="ADD CONDITION GROUP"
        onClick={() => addCndHandler({ isGroup: true })}
        className="text-sm"
        data-testid="filter-add-condition-group-btn"
        startIcon={
          <ODSIcon
            outeIconName="OUTEAddIcon"
            outeIconProps={{
              style: {
                height: 18,
                width: 18,
                color: "#212121",
              },
            }}
          />
        }
      />
    </div>
  );
};

export default Footer;
