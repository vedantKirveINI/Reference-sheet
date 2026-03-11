import React, { useRef, useEffect, useState } from "react";
import classes from "./LeftPanel.module.css";
import {
  NODE_VARIABLES,
  LOCAL_VARIABLES,
  GLOBAL_VARIABLES,
  QUERY_PARAMS,
  HIDDEN_PARAMS,
  FIELDS,
} from "../constants/types.jsx";
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
} from "../constants/categories.jsx";
import NodeVariableSection from "./NodeVariableSection.jsx";
import SearchBar from "./SearchBar.jsx";
import DataBlock from "./DataBlock.jsx";

const LeftPanel = ({
  variables = {},
  allFxDataBlocks = {},
  recentItems = [],
  searchText = "",
  filteredItems = [],
  selectedIndex = -1,
  selectedItem = null,
  onItemClick,
  onItemHover,
  displayFunctionsFor = "all",
  isVerbose = false,
  showArrayStructure = false,
  tableColumns = [],
  onSearchChange,
  onSearchKeyDown,
  onSearchFocus,
}) => {
  const listRef = useRef();
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [selectedBlockContext, setSelectedBlockContext] = useState(null);
  const [searchBarValue, setSearchBarValue] = useState("");

  // Helper function to generate unique block ID with context
  const getBlockId = (block, context = null, index = null) => {
    if (!block) return null;
    const baseId =
      block.value || block.name || block.displayValue || JSON.stringify(block);

    if (context && index !== null) {
      return `${context}-${baseId}-${index}`;
    } else if (context) {
      return `${context}-${baseId}`;
    }
    return baseId;
  };

  useEffect(() => {
    if (selectedItem) {
      // For selectedItem from parent, use base ID without context
      setSelectedBlockId(getBlockId(selectedItem));
      setSelectedBlockContext(null);
    }
  }, [selectedItem]);

  // Helper function to get blocks for a category (matching FormulaBarV3 pattern)
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

  // Check if variables have nested schema
  const hasNestedSchema = (variablesData) => {
    if (!variablesData) return false;
    const nodeVars = variablesData[NODE_VARIABLES] || [];
    return nodeVars.some((v) => v.data?.schema || v.schema);
  };

  // Handler for block click
  const handleBlockClick = (e, block, context = null, index = null) => {
    e.stopPropagation();
    const blockId = getBlockId(block, context, index);
    setSelectedBlockId(blockId);
    setSelectedBlockContext(context);
    const { nodeNumber, ...blockWithoutNodeNumber } = block;
    onItemClick(blockWithoutNodeNumber);
  };

  // Handler for block hover/select
  const handleBlockSelect = (block, context = null, index = null) => {
    const blockId = getBlockId(block, context, index);
    setSelectedBlockId(blockId);
    setSelectedBlockContext(context);
    onItemHover(block);
  };

  // Check if block is selected
  const isBlockSelected = (block, context = null, index = null) => {
    if (!selectedBlockId) return false;
    const currentId = getBlockId(block, context, index);
    // If context is provided, both ID and context must match
    if (context !== null) {
      return currentId === selectedBlockId && context === selectedBlockContext;
    }
    // Fallback for legacy compatibility (no context)
    return currentId === selectedBlockId;
  };

  // Handler for schema list click (for nested variables)
  const handleSchemaListClick = (clickData) => {
    if (clickData && typeof clickData === "object") {
      const { nodeNumber, ...blockWithoutNodeNumber } = clickData;
      onItemClick(blockWithoutNodeNumber);
    }
  };

  // Handler for schema list hover
  const handleSchemaListHover = (block) => {
    if (block) {
      const blockId = block.value || block.subType;
      setSelectedBlockId(blockId);
      setSelectedBlockContext("nested");
      onItemHover(block);
    }
  };

  // Render nested variables
  const renderNestedVariables = () => {
    const variablesData = allFxDataBlocks[VARIABLES];
    if (!variablesData) return null;

    const nodeVars = variablesData[NODE_VARIABLES] || [];
    if (nodeVars.length === 0) return null;

    // Get hoveredBlockId for nested variables (using value or subType)
    const hoveredBlockId =
      selectedBlockContext === "nested" && selectedBlockId
        ? selectedBlockId
        : null;

    return (
      <div className={classes.nestedVariables}>
        <NodeVariableSection
          nodeVariables={nodeVars}
          onClick={handleSchemaListClick}
          onHover={handleSchemaListHover}
          hoveredBlockId={hoveredBlockId}
          isVerbose={isVerbose}
          defaultExpanded={false}
          showArrayStructure={showArrayStructure}
        />
      </div>
    );
  };

  // Get categories from allFxDataBlocks
  const categories = Object.keys(allFxDataBlocks).filter(
    (k) => k !== TABLE_COLUMNS
  );

  // Render blocks list (matching FxPopperV3 pattern)
  const renderBlocksList = () => {
    if (searchText && filteredItems.length > 0) {
      return (
        <div className={classes.blocksList}>
          {filteredItems.map((block, index) => (
            <DataBlock
              key={`search-${getBlockId(block, "search", index)}-${index}`}
              block={block}
              onClick={(e, b) => handleBlockClick(e, b, "search", index)}
              onHover={(b) => handleBlockSelect(b, "search", index)}
              isHovered={isBlockSelected(block, "search", index)}
            />
          ))}
        </div>
      );
    }

    if (searchText && filteredItems.length === 0) {
      return (
        <div className={classes.noResults}>No results for "{searchText}"</div>
      );
    }

    return (
      <div className={classes.blocksList}>
        {/* Recent items section */}
        {recentItems.length > 0 && searchText.length === 0 && (
          <div className={classes.categorySection}>
            <div className={classes.categoryHeader}>
              <span className={classes.categoryIcon}>🕐</span>
              <span className={classes.categoryLabel}>Recently Used</span>
            </div>
            {recentItems.slice(0, 3).map((item, idx) => (
              <DataBlock
                key={`recent-${getBlockId(item, "recent", idx)}-${idx}`}
                block={item}
                onClick={(e, b) => handleBlockClick(e, b, "recent", idx)}
                onHover={(b) => handleBlockSelect(b, "recent", idx)}
                isHovered={isBlockSelected(item, "recent", idx)}
              />
            ))}
          </div>
        )}

        {/* Categories from allFxDataBlocks */}
        {categories.map((category) => {
          if (category === VARIABLES) {
            const variablesData = allFxDataBlocks[VARIABLES];
            const hasNested = hasNestedSchema(variablesData);

            if (hasNested) {
              // Render nested + flat variables
              return (
                <div key={category} className={classes.categorySection}>
                  <div className={classes.categoryHeader}>
                    <span className={classes.categoryIcon}>
                      {CATEGORY_ICONS[category]}
                    </span>
                    <span className={classes.categoryLabel}>
                      {CATEGORY_LABELS[category]}
                    </span>
                  </div>
                  {renderNestedVariables()}
                  {getBlocksForCategory(category)
                    .filter((block) => block.subCategory !== NODE_VARIABLES)
                    .map((block, index) => (
                      <DataBlock
                        key={`${category}-${getBlockId(
                          block,
                          category,
                          index
                        )}-${index}`}
                        block={{ ...block, nodeNumber: index + 1 }}
                        onClick={(e, b) =>
                          handleBlockClick(e, b, category, index)
                        }
                        onHover={(b) => handleBlockSelect(b, category, index)}
                        isHovered={isBlockSelected(block, category, index)}
                      />
                    ))}
                </div>
              );
            } else {
              // Render all variables as DataBlock (flat)
              const blocks = getBlocksForCategory(category);
              if (blocks.length === 0) return null;

              return (
                <div key={category} className={classes.categorySection}>
                  <div className={classes.categoryHeader}>
                    <span className={classes.categoryIcon}>
                      {CATEGORY_ICONS[category]}
                    </span>
                    <span className={classes.categoryLabel}>
                      {CATEGORY_LABELS[category]}
                    </span>
                  </div>
                  {blocks.map((block, index) => (
                    <DataBlock
                      key={`${category}-${getBlockId(
                        block,
                        category,
                        index
                      )}-${index}`}
                      block={{ ...block, nodeNumber: index + 1 }}
                      onClick={(e, b) =>
                        handleBlockClick(e, b, category, index)
                      }
                      onHover={(b) => handleBlockSelect(b, category, index)}
                      isHovered={isBlockSelected(block, category, index)}
                    />
                  ))}
                </div>
              );
            }
          }

          const blocks = getBlocksForCategory(category);
          if (blocks.length === 0) return null;

          return (
            <div key={category} className={classes.categorySection}>
              <div className={classes.categoryHeader}>
                <span className={classes.categoryIcon}>
                  {CATEGORY_ICONS[category]}
                </span>
                <span className={classes.categoryLabel}>
                  {CATEGORY_LABELS[category]}
                </span>
              </div>
              {blocks.map((block, index) => (
                <DataBlock
                  key={`${category}-${getBlockId(
                    block,
                    category,
                    index
                  )}-${index}`}
                  block={{ ...block, nodeNumber: index + 1 }}
                  onClick={(e, b) => handleBlockClick(e, b, category, index)}
                  onHover={(b) => handleBlockSelect(b, category, index)}
                  isHovered={isBlockSelected(block, category, index)}
                />
              ))}
            </div>
          );
        })}

        {/* Render TABLE_COLUMNS separately if it exists */}
        {allFxDataBlocks[TABLE_COLUMNS] && (
          <div className={classes.categorySection}>
            <div className={classes.categoryHeader}>
              <span className={classes.categoryIcon}>
                {CATEGORY_ICONS[TABLE_COLUMNS]}
              </span>
              <span className={classes.categoryLabel}>
                {CATEGORY_LABELS[TABLE_COLUMNS]}
              </span>
            </div>
            {getBlocksForCategory(TABLE_COLUMNS).map((block, index) => (
              <DataBlock
                key={`${TABLE_COLUMNS}-${getBlockId(
                  block,
                  TABLE_COLUMNS,
                  index
                )}-${index}`}
                block={{ ...block, nodeNumber: index + 1 }}
                onClick={(e, b) => handleBlockClick(e, b, TABLE_COLUMNS, index)}
                onHover={(b) => handleBlockSelect(b, TABLE_COLUMNS, index)}
                isHovered={isBlockSelected(block, TABLE_COLUMNS, index)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={classes.container} ref={listRef}>
      <div className={classes.searchWrapper}>
        <SearchBar
          value={searchBarValue}
          onChange={(val) => {
            setSearchBarValue(val);
            onSearchChange(val);
          }}
          onKeyDown={onSearchKeyDown}
          onFocus={onSearchFocus}
          placeholder="Search"
        />
      </div>
      <div className={classes.content}>{renderBlocksList()}</div>
    </div>
  );
};

export default LeftPanel;
