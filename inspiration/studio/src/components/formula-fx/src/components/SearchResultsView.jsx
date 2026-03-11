import React, { memo, useMemo } from "react";
import { getLucideIcon } from "@/components/icons";
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
import {
  NODE_VARIABLES,
  LOCAL_VARIABLES,
  GLOBAL_VARIABLES,
  QUERY_PARAMS,
  HIDDEN_PARAMS,
  VARIABLES as VARIABLES_TYPE,
} from "../constants/types.js";
import DataBlock from "./DataBlock.jsx";
import NodeVariableSection from "./NodeVariableSection.jsx";
import { buildPrunedNodeTreesFromDescriptors } from "../utils/fx-utils.jsx";
import { checkTypeCompatibility } from "../utils/type-inference.js";
import { getFunctionInfo } from "../utils/function-type-registry.js";
import classes from "./LeftPanel.module.css";

function getBlocksForCategory(allFxDataBlocks, category) {
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
}

function getCategoryForBlock(block, allFxDataBlocks) {
  if (block.section === "variables" || block.subCategory === "NODE_VARIABLES") return VARIABLES;
  if (block.section === "operators" || block.section === "keywords") return null;

  const categoryFromBlock = block.category || block.subCategory;
  const functionCategories = [ARITHMETIC, TEXT_AND_BINARY, LOGICAL, DATE_AND_TIME, ARRAY, OTHER];

  if (categoryFromBlock && functionCategories.includes(categoryFromBlock)) {
    return categoryFromBlock;
  }

  const blockValue = block.value || block.name;
  if (!blockValue) return null;
  for (const cat of functionCategories) {
    const catData = allFxDataBlocks[cat];
    if (!catData) continue;
    for (const subCat of Object.keys(catData)) {
      if (Array.isArray(catData[subCat])) {
        if (catData[subCat].some((item) => (item.value || item.name) === blockValue)) {
          return cat;
        }
      }
    }
  }
  return null;
}

const VARIABLE_SUBSECTION_ORDER = [
  NODE_VARIABLES,
  LOCAL_VARIABLES,
  GLOBAL_VARIABLES,
  QUERY_PARAMS,
  HIDDEN_PARAMS,
  VARIABLES_TYPE,
];

const FUNCTION_CATEGORY_ORDER = [
  ARITHMETIC,
  TEXT_AND_BINARY,
  LOGICAL,
  DATE_AND_TIME,
  ARRAY,
  OTHER,
];

const SUBCATEGORY_LABELS = {
  [NODE_VARIABLES]: "Node variables",
  [LOCAL_VARIABLES]: "Local",
  [GLOBAL_VARIABLES]: "Global",
  [QUERY_PARAMS]: "Query params",
  [HIDDEN_PARAMS]: "Hidden params",
  [VARIABLES_TYPE]: "Variables",
};

const isFunctionBlock = (block) => {
  return block.subCategory === "FUNCTIONS" || block.type === "FUNCTIONS";
};

function SearchResultsView({
  filteredItems = [],
  searchText = "",
  allFxDataBlocks = {},
  getBlockId,
  onBlockClick,
  onBlockHover,
  isBlockSelected,
  getVariableTypeCompat,
  expectedType = "any",
  isVerbose = false,
  showArrayStructure = false,
  selectedBlockId = null,
}) {

  const { dataGroups, formulaGroups } = useMemo(() => {
    if (!searchText?.trim() || filteredItems.length === 0) {
      return { dataGroups: [], formulaGroups: [] };
    }
    const dataBySubcategory = {};
    const formulaByCategory = {};
    const tableColumnBlocks = [];
    const tableColumnSet = new Set(
      getBlocksForCategory(allFxDataBlocks, TABLE_COLUMNS).map((b) => b.value || b.name).filter(Boolean),
    );

    filteredItems.forEach((block) => {
      const cat = getCategoryForBlock(block, allFxDataBlocks);
      const blockVal = block.value || block.name;
      if (cat === VARIABLES) {
        const sub = block.category || NODE_VARIABLES;
        if (!dataBySubcategory[sub]) dataBySubcategory[sub] = [];
        dataBySubcategory[sub].push(block);
      } else if (allFxDataBlocks[TABLE_COLUMNS] && tableColumnSet.has(blockVal)) {
        tableColumnBlocks.push(block);
      } else if (cat && FUNCTION_CATEGORY_ORDER.includes(cat)) {
        if (!formulaByCategory[cat]) formulaByCategory[cat] = [];
        formulaByCategory[cat].push(block);
      }
    });

    const nodeVariablesRaw = allFxDataBlocks[VARIABLES]?.[NODE_VARIABLES] || [];

    const dataGroupsResult = VARIABLE_SUBSECTION_ORDER.filter(
      (sub) => dataBySubcategory[sub]?.length,
    ).map((sub) => {
      const blocks = dataBySubcategory[sub]; //[{}, {}, {}]
      const group = { subcategory: sub, label: SUBCATEGORY_LABELS[sub], blocks };
      if (sub === NODE_VARIABLES) {
        group.prunedNodes = buildPrunedNodeTreesFromDescriptors(blocks, nodeVariablesRaw);
      }
      return group;
    });

    if (tableColumnBlocks.length) {
      dataGroupsResult.push({
        subcategory: TABLE_COLUMNS,
        label: CATEGORY_LABELS[TABLE_COLUMNS],
        blocks: tableColumnBlocks,
      });
    }

    const formulaGroupsResult = FUNCTION_CATEGORY_ORDER.filter(
      (cat) => formulaByCategory[cat]?.length,
    ).map((cat) => ({ category: cat, blocks: formulaByCategory[cat] }));

    return { dataGroups: dataGroupsResult, formulaGroups: formulaGroupsResult };
  }, [searchText, filteredItems, allFxDataBlocks]);

  return (
    <>
      {dataGroups.length > 0 && (
        <div className={classes.megaSection}>
          <div className={classes.megaSectionHeader}>
            <span className={classes.megaSectionIcon}>
              {getLucideIcon("Box", { size: 14, className: "text-muted-foreground" })}
            </span>
            <span className={classes.megaSectionLabel}>Your Data</span>
          </div>

          {dataGroups.map((group) => (
            <div key={group.subcategory} className={classes.categorySection}>
              <div className={classes.categoryHeader}>
                {group.subcategory === TABLE_COLUMNS && CATEGORY_ICONS[TABLE_COLUMNS] && (
                  <span className={classes.categoryIcon}>
                    {["Calendar", "Settings", "Table2"].includes(CATEGORY_ICONS[TABLE_COLUMNS])
                      ? getLucideIcon(CATEGORY_ICONS[TABLE_COLUMNS], { size: 12 })
                      : CATEGORY_ICONS[TABLE_COLUMNS]}
                  </span>
                )}
                <span className={classes.categoryLabel}>{group.label}</span>
              </div>

              {group.subcategory === NODE_VARIABLES &&
                group.prunedNodes &&
                group.prunedNodes.length > 0 ? (
                <div className={classes.nestedVariables}>
                  <NodeVariableSection
                    processedNodes={group.prunedNodes}
                    onClick={onBlockClick}
                    onHover={onBlockHover}
                    selectedBlockId={selectedBlockId}
                    expectedType={expectedType}
                    isVerbose={isVerbose}
                    showArrayStructure={showArrayStructure}
                    defaultExpanded={true}
                  />
                </div>
              ) : (
                group.blocks.map((block, index) => (
                  <DataBlock
                    key={`search-data-${group.subcategory}-${getBlockId(block)}-${index}`}
                    block={{ ...block, nodeNumber: index + 1 }}
                    onClick={onBlockClick}
                    onHover={onBlockHover}
                    isSelected={isBlockSelected(block)}
                    isIncompatible={getVariableTypeCompat(block, expectedType)}
                  />
                ))
              )}
            </div>
          ))}
        </div>
      )}

      {formulaGroups.length > 0 && (
        <div className={classes.megaSection}>
          <div className={classes.megaSectionHeader}>
            <span className={classes.megaSectionIcon}>ƒx</span>
            <span className={classes.megaSectionLabel}>Formulas</span>
          </div>

          {formulaGroups.map((group) => (
            <div key={group.category} className={classes.categorySection}>
              <div className={classes.categoryHeader}>
                <span className={classes.categoryIcon}>
                  {["Calendar", "Settings", "Table2"].includes(CATEGORY_ICONS[group.category])
                    ? getLucideIcon(CATEGORY_ICONS[group.category], { size: 12 })
                    : CATEGORY_ICONS[group.category]}
                </span>
                <span className={classes.categoryLabel}>
                  {CATEGORY_LABELS[group.category]}
                </span>
              </div>

              {group.blocks.map((block, index) => {
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
                    key={`search-fn-${group.category}-${getBlockId(block)}-${index}`}
                    block={{ ...block, nodeNumber: index + 1 }}
                    onClick={onBlockClick}
                    onHover={onBlockHover}
                    isSelected={isBlockSelected(block)}
                    isIncompatible={fnIncompatible}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default memo(SearchResultsView);
