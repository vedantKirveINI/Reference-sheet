import React, {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
// import Button from "oute-ds-button";
// import Icon from "oute-ds-icon";
import { ODSButton as Button, ODSIcon as Icon } from "@src/module/ods";
import StatementRow from "../../components/statement-row/StatementRow";
import styles from "../../styles/styles.module.css";
import { getDefaultCondition } from "../../utils/utils";

const Configure = forwardRef(
  (
    {
      initialData = [],
      variables,
      availableNodes,
      onAddJumpTo = () => {},
      addEndNodeInElse,
    },
    ref
  ) => {
    const [statements, setStatements] = useState([
      {
        id: Date.now(),
        type: "if",
        logicType: "AND",
        conditions: [getDefaultCondition()],
        groups: [],
        isAdvanced: false,
      },
      { id: Date.now() + 5, type: "else" },
    ]);

    const transFormedAvailableNodes = useMemo(() => {
      const actionsHashSet = new Set();
      statements?.forEach((statement) => {
        if (statement.action) {
          actionsHashSet.add(statement.action);
        }
      });
      const nodes = structuredClone(availableNodes);
      nodes.forEach((node) => {
        if (actionsHashSet.has(node.key)) {
          node.disabled = true;
        }
      });
      return nodes;
    }, [statements, availableNodes]);

    const addElseIf = useCallback(() => {
      setStatements((prev) => [
        ...prev.slice(0, -1),
        {
          id: Date.now(),
          type: "else-if",
          logicType: "AND",
          conditions: [getDefaultCondition()],
          groups: [],
          isAdvanced: false,
        },
        prev[prev.length - 1],
      ]);
    }, []);
    const renderStatements = useCallback(() => {
      return statements?.map((statement, index) => {
        if (statement.type === "else") {
          return (
            <Fragment key={`${statement.id}-${index}`}>
              <Button
                startIcon={
                  <Icon
                    outeIconName="OUTEAddIcon"
                    outeIconProps={{ sx: { color: "#212121" } }}
                  />
                }
                variant="black-outlined"
                data-testid="add-else-if-button"
                label="ADD CONDITION"
                onClick={addElseIf}
                sx={{ width: "fit-content" }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  justifyContent: "flex-end",
                }}
                data-testid="else-goto-node"
              >
                <div style={{ borderBottom: "0.0625rem solid #E0E0E0" }} />
                <StatementRow
                  index={index}
                  statement={statement}
                  variables={variables}
                  availableNodes={transFormedAvailableNodes}
                  onChange={(newStatement) => {
                    setStatements((prev) => {
                      prev[index] = { ...newStatement };
                      return [...prev];
                    });
                  }}
                  onDelete={() => {
                    setStatements((prev) => {
                      prev.splice(index, 1);
                      return [...prev];
                    });
                  }}
                  onAddJumpTo={(key) => onAddJumpTo({ key, index })}
                  addEndNodeInElse={addEndNodeInElse}
                />
              </div>
            </Fragment>
          );
        }
        return (
          <StatementRow
            index={index}
            key={`${statement.id}-${index}`}
            statement={statement}
            variables={variables}
            availableNodes={transFormedAvailableNodes}
            onChange={(statement) => {
              setStatements((prev) => {
                prev[index] = statement;
                return [...prev];
              });
            }}
            onDelete={() => {
              setStatements((prev) => {
                prev.splice(index, 1);
                return [...prev];
              });
            }}
            onAddJumpTo={(key) => onAddJumpTo({ key, index })}
            addEndNodeInElse={addEndNodeInElse}
          />
        );
      });
    }, [
      addElseIf,
      transFormedAvailableNodes,
      onAddJumpTo,
      statements,
      variables,
    ]);
    useImperativeHandle(ref, () => {
      return {
        getData: () => {
          return statements;
        },
        updateAction: (statementIndex, action) => {
          setStatements((prev) => {
            prev[statementIndex].action = !action
              ? prev[statementIndex].action || null
              : action;
            return [...prev];
          });
        },
      };
    }, [statements]);
    useEffect(() => {
      if (initialData?.length > 0) {
        setStatements(initialData);
      }
    }, [initialData]);
    return (
      <div className={styles.statementsContainer}>{renderStatements()}</div>
    );
  }
);

export default Configure;
