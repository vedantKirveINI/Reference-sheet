import React, {
  forwardRef,
  Fragment,
  useImperativeHandle,
  useMemo,
} from "react";
import { Plus, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatementRow from "./StatementRow";
import { THEME } from "../constants";

const ConfigureTab = forwardRef(
  (
    {
      statements,
      setStatements,
      addElseIf,
      updateStatement,
      deleteStatement,
      updateAction,
      variables,
      availableNodes,
      onAddNode = () => { },
      addEndNodeInElse,
    },
    ref
  ) => {
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

    useImperativeHandle(
      ref,
      () => ({
        getData: () => statements,
        updateAction: (statementIndex, action) => {
          updateAction(statementIndex, action);
        },
      }),
      [statements, updateAction]
    );

    return (
      <div className="w-full h-full flex flex-col gap-5 p-4 overflow-auto [&>*]:flex-shrink-0">
        <div className="flex items-start gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: THEME.iconBg }}
          >
            <GitBranch className="w-4 h-4" style={{ color: THEME.iconColor }} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-sm">Conditional Branching</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Create If / Else-If / Else chains to route your workflow. Each block supports AND/OR logic with nested groups.
            </p>
          </div>
        </div>

        {statements?.map((statement, stmtIndex) => {
          if (statement.type === "else") {
            return (
              <Fragment key={`${statement.id}-${stmtIndex}`}>
                <div className="flex items-center justify-center">
                  <Button
                    variant="outline"
                    className="border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
                    data-testid="add-else-if-button"
                    onClick={addElseIf}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Else-If Branch
                  </Button>
                </div>
                <StatementRow
                  index={stmtIndex}
                  statement={statement}
                  variables={variables}
                  availableNodes={transFormedAvailableNodes}
                  onChange={(newStatement) =>
                    updateStatement(stmtIndex, newStatement)
                  }
                  onDelete={() => deleteStatement(stmtIndex)}
                  onAddNode={() => onAddNode(stmtIndex)}
                  addEndNodeInElse={addEndNodeInElse}
                />
              </Fragment>
            );
          }
          return (
            <StatementRow
              index={stmtIndex}
              key={`${statement.id}-${stmtIndex}`}
              statement={statement}
              variables={variables}
              availableNodes={transFormedAvailableNodes}
              onChange={(newStatement) =>
                updateStatement(stmtIndex, newStatement)
              }
              onDelete={() => deleteStatement(stmtIndex)}
              onAddNode={() => onAddNode(stmtIndex)}
              addEndNodeInElse={addEndNodeInElse}
            />
          );
        })}
      </div>
    );
  }
);

ConfigureTab.displayName = "ConfigureTab";

export default ConfigureTab;
