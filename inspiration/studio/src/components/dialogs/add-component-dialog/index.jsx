import React, { useState } from "react";
// import { ODSButton } from "@src/module/ods";
// import { ODSIcon } from "@src/module/ods";
// import { ODSTextField } from "@src/module/ods";
// import VTab from "oute-ds-v-tab";
import { ODSButton, ODSIcon, ODSTextField, ODSVTab as VTab } from "@src/module/ods";
import { FLOW_CONTROLS } from "./constants/flow-control-constants";
import { ALL_COMPONENTS } from "./constants/add-component-dialog-constants";
import ComponentNotFound from "./ComponentNotFound";
import classes from "./index.module.css";
const AddComponentTabPanel = ({ components, onAddNewNode = () => {} }) => {
  return (
    <div style={{ width: "auto", height: "400px", overflow: "auto" }}>
      {components.length === 0 && <ComponentNotFound />}
      {components.length > 0 && (
        <div className={classes["component-grid"]}>
          {components?.map((c, index) => {
            return (
              <ODSButton
                key={`${index}_add-component_${c.type}`}
                label={c.type}
                variant="text"
                style={{ justifyContent: "flex-start" }}
                startIcon={
                  <ODSIcon
                    imageProps={{ src: c.src, width: 45, height: 45 }}
                    alt={c.type}
                  />
                }
                onClick={() => {
                  onAddNewNode(c);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
const AddComponentDialog = ({ onAddNewNode = () => {} }) => {
  const tabData = [
    {
      label: "All",
      panelComponent: AddComponentTabPanel,
      panelComponentProps: {
        components: ALL_COMPONENTS,
        onAddNewNode,
      },
    },
    {
      label: FLOW_CONTROLS,
      panelComponent: AddComponentTabPanel,
      panelComponentProps: {
        components: ALL_COMPONENTS.filter((c) => c.module === FLOW_CONTROLS),
        onAddNewNode,
      },
    },
    // {
    //   label: MODULE,
    //   panelComponent: AddComponentTabPanel,
    //   panelComponentProps: {
    //     components: ALL_COMPONENTS.filter((c) => c.module === MODULE),
    //     onAddNewNode,
    //   },
    // },
    // {
    //   label: POSTMAN,
    //   panelComponent: AddComponentTabPanel,
    //   panelComponentProps: {
    //     components: ALL_COMPONENTS.filter((c) => c.module === POSTMAN),
    //     onAddNewNode,
    //   },
    // },
  ];
  const [searchText, setSearchText] = useState("");
  const [filteredComponents, setFilteredComponents] = useState([]);
  const filterComponents = (e) => {
    setSearchText(e.target.value);
    setFilteredComponents(() => {
      return ALL_COMPONENTS.filter((c) => {
        return (
          c.type?.toLowerCase()?.includes(e.target?.value?.toLowerCase()) ||
          c.module?.toLowerCase()?.includes(e.target?.value?.toLowerCase())
        );
      });
    });
  };
  return (
    <div className={classes["add-dialog-container"]}>
      <ODSTextField onChange={filterComponents} />
      {searchText && (
        <AddComponentTabPanel
          components={filteredComponents}
          onAddNewNode={onAddNewNode}
        />
      )}
      {!searchText && <VTab tabData={tabData} />}
    </div>
  );
};

export default AddComponentDialog;
