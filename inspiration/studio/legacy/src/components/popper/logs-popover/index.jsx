import React, { useRef, useEffect, useState, useMemo } from "react";
// import AdvancedLabel from "oute-ds-advanced-label";
// import Icon from "oute-ds-icon";
// import Popover from "oute-ds-popover";
// import Button from "oute-ds-button";
import DialogTitle from "@mui/material/DialogTitle";
// import ODSLabel from "oute-ds-label";
// import { FormulaBar } from "oute-ds-formula-bar";
import { ODSAdvancedLabel as AdvancedLabel, ODSIcon as Icon, ODSPopover as Popover, ODSButton as Button, ODSLabel, FormulaBar } from "@src/module/ods";
import classes from "./index.module.css";
import _ from "lodash";

const AddLogsPopover = ({
  nodeData,
  popoverCoordinates,
  variables = {},
  onSave = () => {},
  onDiscard = () => {},
  onClose = () => {},
}) => {
  const [showAddLogsPopover, setAddLogsPopover] = useState(false);
  const [beforeExecutionLogs, setBeforeExecutionLogs] = useState(
    nodeData?.logs?.before,
  );
  const [afterExecutionLogs, setAfterExecutionLogs] = useState(
    nodeData?.logs?.after,
  );

  const popoverRef = useRef(null);

  const beforeLogsVariables = useMemo(() => {
    return {
      ...variables,
      NODE: variables.NODE.filter((node) => node.key !== nodeData?.key),
    };
  }, [nodeData?.key, variables]);

  useEffect(() => {
    setTimeout(() => {
      setAddLogsPopover(true);
    }, 100);
  }, []);
  return (
    <>
      <div
        ref={popoverRef}
        style={{
          position: "absolute",
          ...popoverCoordinates,
        }}
      />
      <Popover
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
            },
          },
        }}
        open={showAddLogsPopover}
        onClose={onClose}
        anchorEl={popoverRef.current}
      >
        <div className={classes["container"]}>
          <DialogTitle
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(min-content, 1fr) auto",
            }}
            sx={{
              color: nodeData.foreground,
              background: nodeData.background,
            }}
          >
            <AdvancedLabel
              labelText={nodeData?.name}
              labelProps={{
                backgroundColor: nodeData?.background,
                color: nodeData?.foregrounsd,
                sx: {
                  fontSize: 20,
                },
              }}
              leftAdornment={
                <Icon
                  imageProps={{
                    src: nodeData?._src,
                    width: 30,
                    height: 30,
                    style: { borderRadius: "50%" },
                  }}
                  outeIconProps={{
                    "data-testid": "add-logs-icon",
                  }}
                />
              }
            />
            <div className={classes["close"]}>
              <Icon
                outeIconName="OUTECloseIcon"
                outeIconProps={{
                  sx: {
                    width: 20,
                    height: 20,
                    cursor: "pointer",
                    color: nodeData?.foreground,
                  },
                  "data-testid": "add-logs-close-icon",
                }}
                buttonProps={{
                  sx: {
                    padding: 0,
                  },
                }}
                onClick={onClose}
              />
            </div>
          </DialogTitle>

          <div className={classes["content"]}>
            <ODSLabel variant="body1">Before Execution</ODSLabel>
            <FormulaBar
              variables={beforeLogsVariables}
              defaultInputContent={_.cloneDeep(beforeExecutionLogs?.blocks)}
              onInputContentChanged={(content) => {
                setBeforeExecutionLogs({
                  type: "fx",
                  blocks: content,
                });
              }}
              wrapContent={true}
            />
            <ODSLabel variant="body1">After Execution</ODSLabel>
            <FormulaBar
              variables={variables}
              defaultInputContent={_.cloneDeep(afterExecutionLogs?.blocks)}
              onInputContentChanged={(content) => {
                setAfterExecutionLogs({
                  type: "fx",
                  blocks: content,
                });
              }}
              wrapContent={true}
            />
          </div>
          <div className={classes["footer"]}>
            <Button
              variant="black-outlined"
              data-testid="add-logs-discard"
              label="DISCARD"
              onClick={onClose}
            />
            <Button
              data-testid="add-logs-save"
              label="SAVE"
              variant="black"
              onClick={() => {
                onSave({
                  before: beforeExecutionLogs,
                  after: afterExecutionLogs,
                });
                onClose();
              }}
            />
          </div>
        </div>
      </Popover>
    </>
  );
};

export default AddLogsPopover;
