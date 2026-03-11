import React from "react";
// import Autocomplete from "oute-ds-autocomplete";
// import Icon from "oute-ds-icon";
// import Label from "oute-ds-label";
import { ODSAutocomplete as Autocomplete, ODSIcon as Icon, ODSLabel as Label } from "@src/module/ods";
import styles from "../../styles/styles.module.css";
import { CANVAS_MODE, CANVAS_MODES } from "../../../../../../module/constants";

const Action = ({
  index,
  availableNodes,
  selectedAction,
  statementType,
  onChange = () => {},
  onAddJumpTo = () => {},
  addEndNodeInElse,
}) => {
  const selectedNode =
    availableNodes?.find((node) => node.key === selectedAction) || null;

  const onChangeHandler = (event, newValue) => {
    if (!newValue.key) {
      const newNodeKey = Date.now().toString();
      onAddJumpTo(newNodeKey);
      return;
    }
    if (newValue.key === "add-end-node") {
      addEndNodeInElse(index);
      return;
    }
    onChange(newValue ? newValue.key : null);
  };

  return (
    <div className={styles.actionContainer}>
      {statementType !== "else" && (
        <Label variant="subtitle1">Then jump to</Label>
      )}
      <Autocomplete
        variant="black"
        data-testid={`then-jump-to-node-${index}`}
        value={selectedNode}
        onChange={onChangeHandler}
        options={[
          { name: "Add Node" },
          ...availableNodes,
          ...(statementType === "else" &&
          CANVAS_MODE() === CANVAS_MODES.WC_CANVAS
            ? [{ name: "End Node", key: "add-end-node" }]
            : []),
        ]}
        getOptionDisabled={(option) =>
          option?.disabled && option.key !== selectedAction
        }
        getOptionLabel={(option) => option.description || option.name}
        renderOption={(props, option) => {
          if (option.name === "Add Node") {
            return (
              <li
                {...props}
                key={option.key}
                data-testid="add-node-option"
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={(event) => {
                  onChangeHandler(event, option);
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Icon
                    outeIconName="OUTEAddIcon"
                    outeIconProps={{
                      sx: { color: "#212121" },
                    }}
                  />
                  {option.name}
                </div>
              </li>
            );
          }
          return (
            <li {...props} key={option.key} data-testid="add-node-option">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {option._src && (
                  <Icon
                    imageProps={{
                      src: option._src,
                      style: { width: "1.5rem", height: "1.5rem" },
                    }}
                  />
                )}

                {option.description || option.name}
              </div>
            </li>
          );
        }}
        textFieldProps={{
          errorType: "icon",
          error: !selectedNode,
          helperText: !selectedNode ? "Please select an action" : "",
          placeholder: "Select Node",
          InputProps: {
            startAdornment: selectedNode?._src ? (
              <Icon
                imageProps={{
                  src: selectedNode?._src,
                  style: { width: "1.375rem", height: "1.375rem" },
                }}
              />
            ) : null,
          },
        }}
        // disableClearable={false}
        sx={{ width: "100%" }}
      />
    </div>
  );
};

export default Action;
