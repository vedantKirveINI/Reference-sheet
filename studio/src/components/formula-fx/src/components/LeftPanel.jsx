import React, { memo, useCallback, useMemo } from "react";
import classes from "./LeftPanel.module.css";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getLucideIcon } from "@/components/icons";
import {
  NODE_VARIABLES,
  LOCAL_VARIABLES,
  GLOBAL_VARIABLES,
  QUERY_PARAMS,
  HIDDEN_PARAMS,
  FIELDS,
  VARIABLES as VARIABLES_TYPE,
} from "../constants/types.js";

const VARIABLE_SUBSECTION_ORDER = [
  NODE_VARIABLES,
  LOCAL_VARIABLES,
  GLOBAL_VARIABLES,
  QUERY_PARAMS,
  HIDDEN_PARAMS,
  VARIABLES_TYPE,
];

import {
  VARIABLES,
  ARITHMETIC,
  TEXT_AND_BINARY,
  LOGICAL,
  DATE_AND_TIME,
  ARRAY,
  OTHER,
  TABLE_COLUMNS,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
} from "../constants/categories.js";
import NodeVariableSection from "./NodeVariableSection.jsx";
import DataBlock from "./DataBlock.jsx";
import SearchResultsView from "./SearchResultsView.jsx";
import { checkTypeCompatibility } from "../utils/type-inference.js";
import { getFunctionInfo } from "../utils/function-type-registry.js";

const CATEGORY_SHORT_LABELS = {
  [ARITHMETIC]: "Math",
  [TEXT_AND_BINARY]: "Text",
  [LOGICAL]: "Logic",
  [DATE_AND_TIME]: "Date",
  [ARRAY]: "Array",
  [OTHER]: "Other",
  [VARIABLES]: "Data",
  [TABLE_COLUMNS]: "Column",
};

const isFunctionBlock = (block) => {
  return block.subCategory === "FUNCTIONS" || block.type === "FUNCTIONS";
};

const getVariableTypeCompat = (block, expectedType) => {
  if (!expectedType || expectedType === "any") return false;
  const varType = block.variableData?.type || block.returnType;
  if (!varType) return false;
  const compat = checkTypeCompatibility(expectedType, varType);
  return !compat.compatible;
};

const LeftPanel = ({
  variables = {},
  allFxDataBlocks = {},
  recentItems = [],
  searchText = "",
  filteredItems = [],
  selectedItem = null,
  onItemClick,
  onItemHover,
  onInsertFormula = null,
  displayFunctionsFor = "all",
  isVerbose = false,
  showArrayStructure = false,
  tableColumns = [],
  onSearchChange,
  onSearchFocus,
  expectedType = "any",
}) => {
  const getBlockId = (block) => {
    if (!block) return null;
    return (
      block.value || block.name || block.displayValue || JSON.stringify(block)
    );
  };

  const getBlocksForCategory = (category) => {
    const data = allFxDataBlocks[category];
    if (!data) return [];

    const blocks = [];
    Object.keys(data).forEach((subCategory) => {
      if (Array.isArray(data[subCategory])) {
        data[subCategory].forEach((item, idx) => {
          blocks.push({ ...item, subCategory, nodeNumber: idx + 1 });
        });
      }
    });
    return blocks;
  };

  const categories = useMemo(
    () => Object.keys(allFxDataBlocks).filter((k) => k !== TABLE_COLUMNS),
    [allFxDataBlocks],
  );

  const isBlockSelected = useCallback(
    (block) => {
      if (!selectedItem) return false;
      const blockId = getBlockId(block);
      const selectedId = getBlockId(selectedItem);
      return blockId === selectedId;
    },
    [selectedItem],
  );

  const PARAM_SUBCATEGORIES = useMemo(
    () =>
      new Set([LOCAL_VARIABLES, GLOBAL_VARIABLES, QUERY_PARAMS, HIDDEN_PARAMS]),
    [],
  );

  const handleBlockClick = useCallback(
    (block) => {
      if (!block) {
        onItemClick(block);
        return;
      }
      if (block.variableData) {
        onItemClick(block);
        return;
      }
      if (PARAM_SUBCATEGORIES.has(block.subCategory)) {
        const { subCategory, nodeNumber, ...rest } = block;
        const variableData = { ...rest };
        onItemClick({
          variableData,
          subCategory: variableData.mode || subCategory,
          value: variableData.name,
        });
        return;
      }
      onItemClick(block);
    },
    [onItemClick, PARAM_SUBCATEGORIES],
  );

  const handleBlockHover = useCallback(
    (block) => {
      if (onItemHover) onItemHover(block);
    },
    [onItemHover],
  );

  const hasNestedSchema = (variablesData) => {
    if (!variablesData) return false;
    const nodeVars = variablesData[NODE_VARIABLES] || [];
    return nodeVars.some((v) => v.data?.schema || v.schema);
  };

  const handleSchemaListClick = useCallback(
    (clickData) => {
      if (clickData && typeof clickData === "object") {
        onItemClick(clickData);
      }
    },
    [onItemClick],
  );

  const handleSchemaListHover = useCallback(
    (hoverData) => {
      if (hoverData && typeof hoverData === "object" && onItemHover) {
        onItemHover(hoverData);
      }
    },
    [onItemHover],
  );

  const renderNestedVariables = () => {
    const variablesData = allFxDataBlocks[VARIABLES];

    if (!variablesData) return null;

    const nodeVars = variablesData[NODE_VARIABLES] || [];

    const hasAnyVariables = VARIABLE_SUBSECTION_ORDER.some(
      (subKey) =>
        Array.isArray(variablesData[subKey]) &&
        variablesData[subKey].length > 0,
    );
    if (!hasAnyVariables) return null;

    return (
      <div className={classes.nestedVariables}>
        <NodeVariableSection
          nodeVariables={nodeVars}
          onClick={handleSchemaListClick}
          onHover={handleSchemaListHover}
          onInsertFormula={onInsertFormula}
          selectedBlockId={selectedItem ? getBlockId(selectedItem) : null}
          isVerbose={isVerbose}
          defaultExpanded={false}
          showArrayStructure={showArrayStructure}
          expectedType={expectedType}
        />
      </div>
    );
  };

  const renderBlocksList = () => {
    if (searchText && filteredItems.length > 0) {
      return (
        <SearchResultsView
          filteredItems={filteredItems}
          searchText={searchText}
          allFxDataBlocks={allFxDataBlocks}
          getBlockId={getBlockId}
          onBlockClick={handleBlockClick}
          onBlockHover={handleBlockHover}
          isBlockSelected={isBlockSelected}
          getVariableTypeCompat={getVariableTypeCompat}
          expectedType={expectedType}
          isVerbose={isVerbose}
          showArrayStructure={showArrayStructure}
          selectedBlockId={selectedItem ? getBlockId(selectedItem) : null}
        />
      );
    }

    if (searchText && filteredItems.length === 0) {
      return (
        <div className="py-6 text-center text-muted-foreground text-sm font-medium">
          No results for "{searchText}"
        </div>
      );
    }

    const variableCategories = categories.filter((c) => c === VARIABLES);
    const functionCategories = categories.filter((c) => c !== VARIABLES);

    const hasVariables =
      variableCategories.length > 0 &&
      (hasNestedSchema(allFxDataBlocks[VARIABLES]) ||
        getBlocksForCategory(VARIABLES).length > 0);
    const hasTableColumns = !!allFxDataBlocks[TABLE_COLUMNS];
    const hasFunctions = functionCategories.some(
      (c) => getBlocksForCategory(c).length > 0,
    );

    return (
      <>
        {(hasVariables || hasTableColumns) && (
          <div className={classes.megaSection}>
            <div className={classes.megaSectionHeader}>
              <span className={classes.megaSectionIcon}>
                {getLucideIcon("Box", { size: 14, className: "text-muted-foreground" })}
              </span>
              <span className={classes.megaSectionLabel}>Your Data</span>
            </div>

            {variableCategories.map((category) => {
              const variablesData = allFxDataBlocks[VARIABLES];
              const hasNested = hasNestedSchema(variablesData);

              if (hasNested) {
                const flatBlocks = getBlocksForCategory(category).filter(
                  (block) => block.subCategory !== NODE_VARIABLES,
                );

                return (
                  <div key={category} className={classes.categorySection}>
                    {renderNestedVariables()}
                    {flatBlocks.map((block, index) => (
                      <DataBlock
                        key={`${category}-${getBlockId(block)}-${index}`}
                        block={{ ...block, nodeNumber: index + 1 }}
                        onClick={handleBlockClick}
                        onHover={handleBlockHover}
                        isSelected={isBlockSelected(block)}
                        isIncompatible={getVariableTypeCompat(block, expectedType)}
                      />
                    ))}
                  </div>
                );
              } else {
                const blocks = getBlocksForCategory(category);
                if (blocks.length === 0) return null;

                return (
                  <div key={category} className={classes.categorySection}>
                    {blocks.map((block, index) => (
                      <DataBlock
                        key={`${category}-${getBlockId(block)}-${index}`}
                        block={{ ...block, nodeNumber: index + 1 }}
                        onClick={handleBlockClick}
                        onHover={handleBlockHover}
                        isSelected={isBlockSelected(block)}
                        isIncompatible={getVariableTypeCompat(block, expectedType)}
                      />
                    ))}
                  </div>
                );
              }
            })}

            {hasTableColumns && (
              <div className={classes.categorySection}>
                <div className={classes.categoryHeader}>
                  {CATEGORY_ICONS[TABLE_COLUMNS] && (
                    <span className={classes.categoryIcon}>
                      {["Calendar", "Settings", "Table2"].includes(CATEGORY_ICONS[TABLE_COLUMNS])
                        ? getLucideIcon(CATEGORY_ICONS[TABLE_COLUMNS], { size: 12 })
                        : CATEGORY_ICONS[TABLE_COLUMNS]}
                    </span>
                  )}
                  <span className={classes.categoryLabel}>
                    {CATEGORY_LABELS[TABLE_COLUMNS]}
                  </span>
                </div>
                {getBlocksForCategory(TABLE_COLUMNS).map((block, index) => (
                  <DataBlock
                    key={`${TABLE_COLUMNS}-${getBlockId(block)}-${index}`}
                    block={{ ...block, nodeNumber: index + 1 }}
                    onClick={handleBlockClick}
                    onHover={handleBlockHover}
                    isSelected={isBlockSelected(block)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {hasFunctions && (
          <div className={classes.megaSection}>
            <div className={classes.megaSectionHeader}>
              <span className={classes.megaSectionIcon}>ƒx</span>
              <span className={classes.megaSectionLabel}>Formulas</span>
            </div>

            {functionCategories.map((category) => {
              const blocks = getBlocksForCategory(category);
              if (blocks.length === 0) return null;

              return (
                <div key={category} className={classes.categorySection}>
                  <div className={classes.categoryHeader}>
                    <span className={classes.categoryIcon}>
                      {["Calendar", "Settings", "Table2"].includes(CATEGORY_ICONS[category])
                        ? getLucideIcon(CATEGORY_ICONS[category], { size: 12 })
                        : CATEGORY_ICONS[category]}
                    </span>
                    <span className={classes.categoryLabel}>
                      {CATEGORY_LABELS[category]}
                    </span>
                  </div>

                  {blocks.map((block, index) => {
                    let fnIncompatible = false;
                    if (expectedType && expectedType !== "any" && isFunctionBlock(block)) {
                      const fnInfo = getFunctionInfo(block.value || block.name);
                      if (fnInfo) {
                        const compat = checkTypeCompatibility(expectedType, fnInfo.returnType);
                        fnIncompatible = !compat.compatible;
                      }
                    }
                    return (
                      <DataBlock
                        key={`${category}-${getBlockId(block)}-${index}`}
                        block={{ ...block, nodeNumber: index + 1 }}
                        onClick={handleBlockClick}
                        onHover={handleBlockHover}
                        isSelected={isBlockSelected(block)}
                        isIncompatible={fnIncompatible}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col bg-card">
      <ScrollArea className="flex-1 min-h-0 overflow-x-hidden">
        <div className="p-3 space-y-4">{renderBlocksList()}</div>
      </ScrollArea>
    </div>
  );
};

export default memo(LeftPanel);
