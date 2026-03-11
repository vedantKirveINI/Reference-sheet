import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
// import AdvancedLabel from "oute-ds-advanced-label";
// import ODSDialog from "oute-ds-dialog";
// import ODSIcon from "oute-ds-icon";
// import default_theme from "oute-ds-shared-assets";
import { ODSAdvancedLabel as AdvancedLabel, ODSDialog, ODSIcon, default_theme } from "@src/module/ods";
import utility from "oute-services-utility-sdk";

import InputGridV2 from "@oute/oute-ds.molecule.input-grid-v2";

import JsonEditorContent from "./JsonEditorContent";
import NoRowsOverlayComponent from "./NoRowsOverlayComponent";

import classes from "./StructurePanel.module.css";

const StructurePanel = forwardRef(
  ({ data, onModifyResponse = () => {} }, ref) => {
    const [showJSONEditorDialog, setShowJSONEditorDialog] = useState(false);
    // const [rowData, setRowData] = useState([]);
    const gridRef = useRef();
    const closeJsonEditor = () => {
      setShowJSONEditorDialog(false);
    };
    const modifyJSONHandler = (json) => {
      onModifyResponse(json);
      // setRowData([]); //reset rowData
      closeJsonEditor();
    };
    useImperativeHandle(ref, () => {
      return {
        openJsonEditor: () => {
          setShowJSONEditorDialog(true);
        },
      };
    }, []);
    useEffect(() => {
      if (data) {
        const response = utility.jsonToSchema(data, {});
        gridRef.current.updateGrid(response.schema);
      }
    }, [data]);
    return (
      <div
        className={classes["structure-container"]}
        data-testid="structure-container"
      >
        {!!data && <InputGridV2 ref={gridRef} isValueMode={false} readOnly />}
        {!data && (
          <NoRowsOverlayComponent
            onModifyClick={() => setShowJSONEditorDialog(true)}
          />
        )}
        <ODSDialog
          open={showJSONEditorDialog}
          onClose={closeJsonEditor}
          showFullscreenIcon={false}
          hideBackdrop={false}
          dividers={true}
          draggable={false}
          dialogTitle={
            <AdvancedLabel
              labelText="Modify Response"
              labelProps={{
                variant: "h6",
                color: default_theme.palette?.grey["A100"],
              }}
              leftAdornment={
                <ODSIcon
                  outeIconName="OUTECurlyBracesIcon"
                  outeIconProps={{
                    sx: { color: default_theme.palette?.grey["A100"] },
                  }}
                />
              }
            />
          }
          dialogContent={
            <JsonEditorContent
              data={data}
              onClose={closeJsonEditor}
              onModify={modifyJSONHandler}
            />
          }
          dialogWidth="auto"
        />
      </div>
    );
  }
);

export default StructurePanel;
