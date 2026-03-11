import React, { useCallback, useEffect, useRef, useState } from "react";
// import {
//   SchemaList,
//   DataBlock,
//   processNodeVariablesForSchemaList,
// } from "oute-ds-formula-bar";
// import Icon from "oute-ds-icon";
// import Label from "oute-ds-label";
// import Popper from "oute-ds-popper";
// import Tooltip from "oute-ds-tooltip";
import { SchemaList, DataBlock, processNodeVariablesForSchemaList, ODSIcon as Icon, ODSLabel as Label, ODSPopper as Popper, ODSTooltip as Tooltip } from "@src/module/ods";
import styles from "../../styles/styles.module.css";
import InfoTooltip from "../info-tooltip/InfoTooltip";
import { calculateCharacterLimits } from "../../utils/utils";

const VariableSelector = ({
  variables,
  selectedVariable,
  onChange = () => {},
}) => {
  const [current, setCurrent] = useState(selectedVariable || {});
  const processedSchemaData = processNodeVariablesForSchemaList(
    variables?.NODE || []
  );
  const anchorRef = useRef();
  const [open, setOpen] = useState(false);
  const [characterLimits, setCharacterLimits] = useState({
    startChars: 45,
    endChars: 20,
  });
  const handleToggle = useCallback(() => {
    setOpen((prevOpen) => {
      return !prevOpen;
    });
  }, []);
  const handleSelect = (variable) => {
    setCurrent(variable);
    onChange(variable);
    setOpen(false);
  };
  const extractPath = (node) => {
    let nodePath = node.path || [];
    if (nodePath[0] === "response") {
      nodePath = nodePath.slice(1);
    }
    if (node.label) {
      nodePath.splice(nodePath.length - 1, 1, node.label);
    }
    return nodePath.length > 0 ? `.${nodePath.join(".")}` : "";
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      //skip if target is variable-selector
      if (e.target?.closest("#variable-selector")) return;
      if (!e.target?.closest(".variables-popper") && open) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    const updateCharacterLimits = () => {
      if (anchorRef.current) {
        const containerWidth = anchorRef.current.offsetWidth;
        const limits = calculateCharacterLimits(containerWidth);
        setCharacterLimits(limits);
      }
    };

    updateCharacterLimits();

    const handleResize = () => {
      updateCharacterLimits();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (selectedVariable) {
      const node = variables?.NODE?.find(
        (n) => n.key === selectedVariable?.variableData?.nodeId
      );
      if (node) {
        setCurrent((prev) => {
          let newCurrent = {
            ...prev,
            subType: `${node?.description || node?.name}${extractPath(prev?.variableData)}`,
            value: `${node?.description || node?.name}${extractPath(prev?.variableData)}`,
            variableData: {
              ...prev?.variableData,
              nodeName: node?.description || node?.name,
            },
          };
          return newCurrent;
        });
      } else {
        setCurrent((prev) => {
          let newCurrent = {
            ...prev,
            error: true,
            errorMessage: `Node ${prev?.variableData?.nodeName} not found. Please check incoming nodes.`,
          };
          return newCurrent;
        });
      }
    }
  }, [variables?.NODE]);

  useEffect(() => {
    if (anchorRef.current && Object.keys(current).length > 0) {
      const containerWidth = anchorRef.current.offsetWidth;
      const limits = calculateCharacterLimits(containerWidth);
      setCharacterLimits(limits);
    }
  }, [current]);

  return (
    <>
      <div className={`${styles.flexContainer} variable-selector-container`}>
        <div
          ref={anchorRef}
          className={`${styles.variableSelector} ${open ? styles.open : ""} ${Object.keys(current).length > 0 ? "" : styles.error} `}
          onClick={handleToggle}
          id="variable-selector"
          data-testid="condition-variable"
        >
          {Object.keys(current).length > 0 ? (
            <DataBlock
              block={current}
              startChars={characterLimits.startChars}
              endChars={characterLimits.endChars}
            />
          ) : (
            <div
              style={{
                color: "rgba(0,0,0,.38)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              Select Variable
              <Tooltip title="Select a variable to check its value against a condition">
                <div
                  data-testid="condition-variable-error-icon"
                  style={{
                    height: "100%",
                    display: "flex",
                    padding: "0 0.5rem",
                  }}
                >
                  <Icon
                    outeIconName={"OUTEWarningIcon"}
                    outeIconProps={{
                      sx: { color: "var(--error)" },
                    }}
                  />
                </div>
              </Tooltip>
            </div>
          )}
          <Icon
            outeIconName="OUTEChevronRightIcon"
            outeIconProps={{
              sx: { transform: !open ? "rotate(90deg)" : "rotate(-90deg)" },
            }}
          />
        </div>
        <InfoTooltip
          content={
            <Label variant="subtitle2" color="#fff">
              Select a variable to check its value against a condition
            </Label>
          }
        />
      </div>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        className={`${styles.popper} ${styles.variablesPopper} variables-popper`}
        sx={{ width: anchorRef.current?.offsetWidth }}
        placement="bottom-start"
        disablePortal
      >
        {!processedSchemaData?.length && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "6rem",
              padding: "1rem",
            }}
          >
            <Label variant="body1">
              It looks like there are no incoming nodes, which is why you
              don&apos;t see any variables to select. Please connect a node to
              this one and try again
            </Label>
          </div>
        )}
        {processedSchemaData?.length > 0 && (
          <div className={styles.schemaListContainer}>
            {processedSchemaData?.map((option) => (
              <SchemaList
                key={option.nodeId}
                node={option}
                parentKey={option.key}
                onClick={handleSelect}
              />
            ))}
          </div>
        )}
      </Popper>
    </>
  );
};

export default VariableSelector;
