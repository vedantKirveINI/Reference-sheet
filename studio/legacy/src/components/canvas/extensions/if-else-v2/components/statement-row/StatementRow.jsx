import React, { Fragment, useCallback, useEffect, useState } from "react";
// import Autocomplete from "oute-ds-autocomplete";
// import Button from "oute-ds-button";
// import Icon from "oute-ds-icon";
// import Label from "oute-ds-label";
// import Popper from "oute-ds-popper";
import { ODSAutocomplete as Autocomplete, ODSButton as Button, ODSIcon as Icon, ODSLabel as Label, ODSPopper as Popper } from "@src/module/ods";
import Condition from "../condition/Condition";
import GroupCondition from "../group-condition/GroupCondition";
import Action from "../action/Action";
import styles from "../../styles/styles.module.css";
import { getDefaultCondition } from "../../utils/utils";
import InfoTooltip from "../info-tooltip/InfoTooltip";

const StatementRow = ({
  statement,
  variables,
  availableNodes,
  isGroup = false,
  onChange = () => {},
  onDelete = () => {},
  onAddJumpTo = () => {},
  index,
  addEndNodeInElse,
}) => {
  const [showCTAPopper, setShowCTAPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const getRowHeader = (type) => {
    switch (type) {
      case "if":
        return "If condition";
      case "else":
        return "Else go to";
      case "AND":
        return "All of the following conditions are true...";
      case "OR":
        return "Any of the following condition is true...";
      default:
        return "Else if";
    }
  };
  const addCondition = useCallback(() => {
    onChange({
      ...statement,
      conditions: [...statement.conditions, getDefaultCondition()],
    });
  }, [onChange, statement]);
  const addGroupCondition = useCallback(() => {
    onChange({
      ...statement,
      groups: [
        ...statement.groups,
        {
          id: Date.now(),
          conditions: [getDefaultCondition()],
          groups: [],
          logicType: statement?.logicType === "AND" ? "OR" : "AND",
        },
      ],
    });
  }, [onChange, statement]);
  const onConditionChange = useCallback(
    (condition, index) => {
      statement.conditions[index] = condition;
      onChange({ ...statement });
    },
    [onChange, statement]
  );
  const onGroupConditionChange = useCallback(
    (group, index) => {
      statement.groups[index] = group;
      onChange({ ...statement });
    },
    [onChange, statement]
  );
  const deleteCondition = useCallback(
    (index) => {
      statement.conditions.splice(index, 1);
      onChange({ ...statement });
    },
    [onChange, statement]
  );
  const deleteGroupCondition = useCallback(
    (index) => {
      statement.groups.splice(index, 1);
      onChange({ ...statement });
    },
    [onChange, statement]
  );
  const toggleIsAdvanced = useCallback(
    (e) => {
      onChange({ ...statement, isAdvanced: e.target.checked });
    },
    [onChange, statement]
  );
  const logicTypeChangeHandler = useCallback(
    (event, newValue) => onChange({ ...statement, logicType: newValue }),
    [onChange, statement]
  );
  const actionChangeHandler = useCallback(
    (action) => {
      onChange({ ...statement, action: action });
    },
    [onChange, statement]
  );
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target?.closest(".cta-popper") && showCTAPopper)
        setShowCTAPopper(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCTAPopper]);
  return (
    <div
      className={`${styles.statementRow} ${isGroup && styles.isGroup} ${isGroup && "group-row"}`}
    >
      <div className={styles.statementRowHeader}>
        <Label variant={isGroup ? "subtitle1" : "h6"}>
          {isGroup
            ? getRowHeader(statement?.logicType)
            : getRowHeader(statement?.type)}
        </Label>
        {isGroup && (
          <>
            <div className={styles.flexContainer}>
              <Icon
                outeIconName="OUTEAddIcon"
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                  setShowCTAPopper((prev) => !prev);
                }}
                buttonProps={{
                  "data-testid": "nested-add-button",
                  sx: { padding: 0 },
                }}
              />
              <InfoTooltip
                content={
                  <Label variant="subtitle2" color="#fff">
                    Add conditions or nested groups to build complex logic
                  </Label>
                }
              />
            </div>
            <Popper
              open={showCTAPopper}
              anchorEl={anchorEl}
              className={`${styles.popper} cta-popper`}
              placement="bottom-end"
              disablePortal
            >
              <div
                style={{
                  display: "grid",
                  gridAutoFlow: "row",
                  justifyItems: "flex-start",
                  gap: "1rem",
                }}
              >
                <Button
                  sx={{ width: "100%", justifyContent: "flex-start" }}
                  variant="black-text"
                  label="ADD CONDITION"
                  startIcon={<Icon outeIconName="OUTEAddIcon" />}
                  onClick={() => {
                    addCondition();
                    setAnchorEl(null);
                    setShowCTAPopper(false);
                  }}
                />
                <Button
                  sx={{ width: "100%", justifyContent: "flex-start" }}
                  variant="black-text"
                  label="ADD GROUP CONDITION"
                  startIcon={<Icon outeIconName="OUTEAddIcon" />}
                  onClick={() => {
                    addGroupCondition();
                    setAnchorEl(null);
                    setShowCTAPopper(false);
                  }}
                />
              </div>
            </Popper>
          </>
        )}
        {/* {!isGroup && statement.type !== "else" && (
          <Switch
            labelText={<Label variant="body1">Advanced</Label>}
            checked={statement.isAdvanced}
            disabled
            onChange={toggleIsAdvanced}
          />
        )} */}
        {statement.type !== "if" && statement.type !== "else" && (
          <Icon
            outeIconName="OUTETrashIcon"
            outeIconProps={{
              "data-testid": "delete-group-condition",
              sx: { color: "#212121" },
            }}
            onClick={onDelete}
          />
        )}
      </div>
      <div className={styles.statementRowBody}>
        {statement?.conditions?.map((condition, index) => {
          if (index !== 0) {
            return (
              <Fragment key={condition.id}>
                <div className={styles.logicTypeContainer}>
                  <div className={styles.logicTypeStroke} />
                  {index === 1 && (
                    <Autocomplete
                      value={statement?.logicType}
                      options={["AND", "OR"]}
                      data-testid={`logic-operator-${index}`}
                      disabled={index !== 1}
                      searchable={false}
                      selectOnFocus={false}
                      popupIcon={
                        <Icon
                          outeIconName="OUTEExpandMoreIcon"
                          outeIconProps={{
                            "data-testid": "ArrowDropDownIcon",
                            sx: { color: "#fff" },
                          }}
                        />
                      }
                      textFieldProps={{
                        sx: {
                          "& .MuiInputBase-root": {
                            background: "#212121",
                            width: "7rem",
                          },
                          ".MuiOutlinedInput-input": {
                            color: "#fff !important",
                          },
                        },
                        inputProps: {
                          cursor: "default !important",
                        },
                      }}
                      variant="black"
                      onChange={logicTypeChangeHandler}
                    />
                  )}
                  {index !== 1 && (
                    <Button
                      disabled
                      data-testid={`logic-operator-button-${index}`}
                      label={statement?.logicType}
                      sx={{
                        color: "#fff !important",
                        background: "#000 !important",
                        minWidth: "7rem",
                      }}
                    />
                  )}
                  <div className={styles.logicTypeStroke} />
                </div>
                <Condition
                  condition={condition}
                  index={index}
                  variables={variables}
                  isAdvanced={statement?.isAdvanced}
                  onChange={(condition) => {
                    onConditionChange(condition, index);
                  }}
                  onDelete={deleteCondition}
                />
              </Fragment>
            );
          }
          return (
            <Condition
              key={condition.id}
              condition={condition}
              index={index}
              variables={variables}
              isAdvanced={statement?.isAdvanced}
              onChange={(condition) => {
                onConditionChange(condition, index);
              }}
              onDelete={deleteCondition}
            />
          );
        })}
        {statement?.groups?.map((group, index) => {
          return (
            <Fragment key={group.id}>
              <div
                className={styles.logicTypeContainer}
                data-testid={`group-logic-type-container-${index}`}
              >
                <div className={styles.logicTypeStroke} />
                {statement?.conditions?.length === 1 && index === 0 ? (
                  <Autocomplete
                    variant="black"
                    value={statement?.logicType}
                    options={["AND", "OR"]}
                    data-testid={`group-logic-operator-${index}`}
                    searchable={false}
                    selectOnFocus={false}
                    popupIcon={
                      <Icon
                        outeIconName="OUTEExpandMoreIcon"
                        outeIconProps={{
                          "data-testid": "ArrowDropDownIcon",
                          sx: { color: "#fff" },
                        }}
                      />
                    }
                    textFieldProps={{
                      sx: {
                        "& .MuiInputBase-root": {
                          background: "#212121",
                          width: "7rem",
                        },
                        ".MuiOutlinedInput-input": {
                          color: "#fff !important",
                        },
                      },
                      inputProps: {
                        cursor: "default !important",
                      },
                    }}
                    onChange={logicTypeChangeHandler}
                  />
                ) : (
                  <Button
                    disabled
                    sx={{
                      color: "#fff !important",
                      background: "#000 !important",
                      minWidth: "7rem",
                    }}
                    label={statement?.logicType}
                  />
                )}
                <div className={styles.logicTypeStroke} />
              </div>
              <GroupCondition
                group={group}
                index={index}
                parentStatement={statement}
                variables={variables}
                onChange={(group) => {
                  onGroupConditionChange(group, index);
                }}
                onDelete={deleteGroupCondition}
              />
            </Fragment>
          );
        })}
        {!isGroup && statement.type !== "else" && (
          <div className={styles.flexContainer}>
            <div className={styles.statementCTAContainer}>
              <Button
                variant="black-text"
                label="ADD CONDITION"
                data-testid="add-condition"
                startIcon={
                  <Icon
                    outeIconName="OUTEAddIcon"
                    outeIconProps={{ sx: { color: "#212121" } }}
                  />
                }
                onClick={addCondition}
              />
              <InfoTooltip
                content={
                  <Label variant="subtitle2" color="#fff">
                    Add another condition to this statement using AND/OR logic
                  </Label>
                }
              />
              <Button
                variant="black-text"
                label="ADD GROUP CONDITION"
                data-testid="add-group-condition"
                startIcon={
                  <Icon
                    outeIconName="OUTEAddIcon"
                    outeIconProps={{ sx: { color: "#212121" } }}
                  />
                }
                onClick={addGroupCondition}
              />
              <InfoTooltip
                content={
                  <Label variant="subtitle2" color="#fff">
                    Create a nested group of conditions with its own AND/OR
                    logic
                  </Label>
                }
              />
            </div>
          </div>
        )}
        {!isGroup && (
          <Action
            index={index}
            onAddJumpTo={onAddJumpTo}
            availableNodes={availableNodes}
            selectedAction={statement.action}
            statementType={statement.type}
            onChange={actionChangeHandler}
            addEndNodeInElse={addEndNodeInElse}
          />
        )}
      </div>
    </div>
  );
};

export default StatementRow;
