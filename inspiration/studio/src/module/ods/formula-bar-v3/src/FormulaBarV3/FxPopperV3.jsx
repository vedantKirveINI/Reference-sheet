import React, { useEffect, useState, useCallback, useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import { ODSSwitch as Switch } from "../../../index.js";
import classes from "./FxPopperV3.module.css";
import { arithmeticData } from "../data/arithmetic-data.js";
import { textData } from "../data/text-data.js";
import { logicalData } from "../data/logical-data.js";
import { dateData } from "../data/date-data.js";
import { arrayData } from "../data/array-data.js";
import { otherData } from "../data/other-data.js";
import {
  ARITHMETIC,
  ARRAY,
  DATE_AND_TIME,
  EVALUATE_FX,
  LOGICAL,
  OTHER,
  TABLE_COLUMNS,
  TEXT_AND_BINARY,
  VARIABLES,
} from "../constants/categories.js";
import { searchAndConsolidate } from "../utils/search-utils.js";
import { cloneDeep } from "lodash";
import { FIELDS, NODE_VARIABLES } from "../constants/types.js";
import { filterDataForDisplay, processNodeVariablesForSchemaList, filterDataBlocksByType, getFunctionContextFromContent } from "../utils/fx-utils.jsx";
import DataBlockV3 from "./DataBlockV3.jsx";
import { SchemaListV3 } from "./SchemaListV3.jsx";
import AIAssistant from "./AIAssistant.jsx";

const CATEGORY_ICONS = {
  [VARIABLES]: "📦",
  [ARITHMETIC]: "#",
  [TEXT_AND_BINARY]: "Aa",
  [LOGICAL]: "⊕",
  [DATE_AND_TIME]: "📅",
  [ARRAY]: "[",
  [OTHER]: "⚙",
  [TABLE_COLUMNS]: "📊",
};

const CATEGORY_LABELS = {
  [VARIABLES]: "Variables",
  [ARITHMETIC]: "Arithmetic",
  [TEXT_AND_BINARY]: "Text",
  [LOGICAL]: "Logical",
  [DATE_AND_TIME]: "Date & Time",
  [ARRAY]: "Array",
  [OTHER]: "Other",
  [TABLE_COLUMNS]: "Columns",
};

const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '');
};

const getBlockId = (block) => {
  if (!block) return null;
  return block.value || block.name || block.displayValue || JSON.stringify(block);
};

const FxPopperV3 = forwardRef(({
  searchText = "",
  showVariables = true,
  showArithmetic = true,
  showTextAndBinary = true,
  showLogical = true,
  showDateAndTime = true,
  showArray = true,
  showOther = true,
  tableColumns = [],
  variables = {},
  contentRef = null,
  evaluateFxRef = null,
  displayFunctionsFor = "all",
  isVerbose = false,
  showArrayStructure = false,
  onClose = () => {},
  onDataBlockClick = () => {},
  debugMode = false,
  onDebugModeChange = () => {},
  validationErrors = [],
  validationDiagnostics = [],
  showAIAssistant = true,
  onAIFormulaGenerated = () => {},
  expectedType = "any",
  functionRegistry = {},
  currentContent = [],
  cursorPosition = 0,
}, ref) => {
  const [allFxDataBlocks, setAllFxDataBlocks] = useState({});
  const [filteredDataBlocks, setFilteredDataBlocks] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const blocksListRef = useRef(null);

  const hasContent = (data) => {
    if (!data || typeof data !== "object") return false;
    return Object.keys(data).some((key) => {
      if (Array.isArray(data[key])) {
        return data[key].length > 0;
      }
      return data[key] !== null && data[key] !== undefined;
    });
  };

  const functionContext = useMemo(() => {
    if (!currentContent || currentContent.length === 0 || !functionRegistry) {
      return null;
    }
    const effectiveCursorPos = typeof cursorPosition === 'number' ? cursorPosition : currentContent.length;
    return getFunctionContextFromContent(currentContent, effectiveCursorPos, functionRegistry);
  }, [currentContent, cursorPosition, functionRegistry]);

  useEffect(() => {
    let allFxBlocks = {};

    if (displayFunctionsFor === "tables") {
      let filteredTableColumns = tableColumns;
      if (expectedType && expectedType !== 'any') {
        let effectiveType = expectedType;
        let allowConversion = false;
        
        if (functionContext && functionContext.currentFunction) {
          const funcDef = functionContext.functionRegistry?.[functionContext.currentFunction];
          if (funcDef && funcDef.args && funcDef.args[functionContext.currentArgIndex]) {
            const argDef = funcDef.args[functionContext.currentArgIndex];
            effectiveType = argDef.type || expectedType;
            const argAcceptsString = !argDef.type || argDef.type === 'any' || argDef.type.toLowerCase() === 'string';
            const funcReturnsNumber = funcDef.returnType === 'number' || funcDef.returnType === 'integer';
            allowConversion = argAcceptsString && funcReturnsNumber;
          }
        }
        
        filteredTableColumns = tableColumns.filter((col) => {
          const colType = col.returnType || col.type || 'any';
          if (colType === 'any' || effectiveType === 'any') return true;
          const normalizedColType = colType.toLowerCase();
          const normalizedEffectiveType = effectiveType.toLowerCase();
          if (normalizedColType === normalizedEffectiveType) return true;
          if (normalizedEffectiveType === 'number' && (normalizedColType === 'integer' || normalizedColType === 'number')) return true;
          if (allowConversion && normalizedColType === 'string' && normalizedEffectiveType === 'number') return true;
          return false;
        });
      }
      allFxBlocks = {
        ...allFxBlocks,
        [TABLE_COLUMNS]: { [FIELDS]: filteredTableColumns },
      };
    }

    if (showVariables && displayFunctionsFor === "all") {
      let filteredVariables = variables;
      if (expectedType && expectedType !== 'any') {
        filteredVariables = filterDataBlocksByType(variables, expectedType, functionContext);
      }
      allFxBlocks = {
        ...allFxBlocks,
        [VARIABLES]: filteredVariables,
      };
    }

    if (showArithmetic) {
      const filteredArithmetic = filterDataForDisplay(arithmeticData, displayFunctionsFor);
      if (hasContent(filteredArithmetic)) {
        allFxBlocks = { ...allFxBlocks, [ARITHMETIC]: filteredArithmetic };
      }
    }

    if (showTextAndBinary) {
      const filteredText = filterDataForDisplay(textData, displayFunctionsFor);
      if (hasContent(filteredText)) {
        allFxBlocks = { ...allFxBlocks, [TEXT_AND_BINARY]: filteredText };
      }
    }

    if (showLogical) {
      const filteredLogical = filterDataForDisplay(logicalData, displayFunctionsFor);
      if (hasContent(filteredLogical)) {
        allFxBlocks = { ...allFxBlocks, [LOGICAL]: filteredLogical };
      }
    }

    if (showDateAndTime) {
      const filteredDate = filterDataForDisplay(dateData, displayFunctionsFor);
      if (hasContent(filteredDate)) {
        allFxBlocks = { ...allFxBlocks, [DATE_AND_TIME]: filteredDate };
      }
    }

    if (showArray) {
      const filteredArray = filterDataForDisplay(arrayData, displayFunctionsFor);
      if (hasContent(filteredArray)) {
        allFxBlocks = { ...allFxBlocks, [ARRAY]: filteredArray };
      }
    }

    if (showOther) {
      const filteredOther = filterDataForDisplay(otherData, displayFunctionsFor);
      if (hasContent(filteredOther)) {
        allFxBlocks = { ...allFxBlocks, [OTHER]: filteredOther };
      }
    }

    setAllFxDataBlocks({ ...allFxBlocks });
  }, [
    showVariables,
    showArithmetic,
    showTextAndBinary,
    showLogical,
    showDateAndTime,
    showArray,
    showOther,
    contentRef,
    displayFunctionsFor,
    expectedType,
    functionContext,
    variables,
    tableColumns,
  ]);

  useEffect(() => {
    if (searchText) {
      const result = searchAndConsolidate(cloneDeep(allFxDataBlocks), searchText);
      if (Object.keys(result).some((key) => result[key].length > 0)) {
        setFilteredDataBlocks(result);
      } else {
        setFilteredDataBlocks(null);
      }
    } else {
      setFilteredDataBlocks(null);
    }
    setHighlightedIndex(-1);
  }, [searchText, allFxDataBlocks]);

  const categories = Object.keys(allFxDataBlocks).filter((k) => k !== EVALUATE_FX);

  const hasNestedSchema = useCallback((variablesData) => {
    if (!variablesData) return false;
    const nodeVars = variablesData[NODE_VARIABLES] || [];
    return nodeVars.some(v => v.data?.schema || v.schema);
  }, []);

  const getAllVisibleBlocks = useMemo(() => {
    const blocks = [];
    
    if (filteredDataBlocks) {
      Object.keys(filteredDataBlocks).forEach((category) => {
        if (Array.isArray(filteredDataBlocks[category])) {
          filteredDataBlocks[category].forEach((item) => {
            blocks.push({ ...item, category });
          });
        }
      });
    } else {
      categories.forEach((category) => {
        const data = allFxDataBlocks[category];
        if (!data) return;

        if (category === VARIABLES && hasNestedSchema(data)) {
          Object.keys(data).forEach((subCategory) => {
            if (subCategory !== NODE_VARIABLES && Array.isArray(data[subCategory])) {
              data[subCategory].forEach((item, idx) => {
                blocks.push({ ...item, subCategory, nodeNumber: idx + 1, category });
              });
            }
          });
        } else {
          Object.keys(data).forEach((subCategory) => {
            if (Array.isArray(data[subCategory])) {
              data[subCategory].forEach((item, idx) => {
                blocks.push({ ...item, subCategory, nodeNumber: idx + 1, category });
              });
            }
          });
        }
      });
    }
    
    return blocks;
  }, [filteredDataBlocks, allFxDataBlocks, categories, hasNestedSchema]);

  useEffect(() => {
    if (highlightedIndex >= 0 && highlightedIndex < getAllVisibleBlocks.length) {
      const highlightedBlock = getAllVisibleBlocks[highlightedIndex];
      if (highlightedBlock) {
        setSelectedBlock(highlightedBlock);
        setSelectedBlockId(getBlockId(highlightedBlock));
        
        const blockId = getBlockId(highlightedBlock);
        if (blocksListRef.current && blockId) {
          const element = blocksListRef.current.querySelector(`[data-block-id="${CSS.escape(blockId)}"]`);
          if (element) {
            element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      }
    }
  }, [highlightedIndex, getAllVisibleBlocks]);

  const handleKeyDown = useCallback((e) => {
    const blocks = getAllVisibleBlocks;
    if (blocks.length === 0) return false;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < blocks.length - 1 ? prev + 1 : 0;
        return next;
      });
      return true;
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : blocks.length - 1;
        return next;
      });
      return true;
    }
    
    if (e.key === 'Enter' && highlightedIndex >= 0 && highlightedIndex < blocks.length) {
      e.preventDefault();
      const block = blocks[highlightedIndex];
      if (block) {
        const { nodeNumber, ...blockWithoutNodeNumber } = block;
        onDataBlockClick(blockWithoutNodeNumber);
      }
      return true;
    }
    
    if (e.key === 'Escape') {
      e.preventDefault();
      setHighlightedIndex(-1);
      setSelectedBlock(null);
      setSelectedBlockId(null);
      onClose();
      return true;
    }
    
    return false;
  }, [getAllVisibleBlocks, highlightedIndex, onDataBlockClick, onClose]);

  useImperativeHandle(ref, () => ({
    handleKeyDown,
  }), [handleKeyDown]);

  const isBlockHighlighted = useCallback((block, index) => {
    if (highlightedIndex >= 0) {
      return index === highlightedIndex;
    }
    return selectedBlockId && getBlockId(block) === selectedBlockId;
  }, [highlightedIndex, selectedBlockId]);

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

  const getSearchResults = () => {
    if (!filteredDataBlocks) return [];
    const results = [];
    Object.keys(filteredDataBlocks).forEach((category) => {
      if (Array.isArray(filteredDataBlocks[category])) {
        filteredDataBlocks[category].forEach((item) => {
          results.push({ ...item, category });
        });
      }
    });
    return results;
  };

  const handleBlockClick = (e, block) => {
    e.stopPropagation();
    setSelectedBlock(block);
    setSelectedBlockId(getBlockId(block));
    const { nodeNumber, ...blockWithoutNodeNumber } = block;
    onDataBlockClick(blockWithoutNodeNumber);
  };

  const handleBlockSelect = (block) => {
    setHighlightedIndex(-1);
    setSelectedBlock(block);
    setSelectedBlockId(getBlockId(block));
  };

  const isBlockSelected = (block) => {
    return selectedBlockId && getBlockId(block) === selectedBlockId;
  };

  /* EVALUATE functionality commented out for now
  const handleEvaluate = async () => {
    try {
      if (evaluateFxRef?.current?.refreshData) {
        evaluateFxRef.current.refreshData();
      }
    } catch (e) {
      console.error('Evaluation error:', e);
    }
  };
  */

  const handleSchemaListClick = (clickData) => {
    if (clickData && typeof clickData === 'object') {
      const { nodeNumber, ...blockWithoutNodeNumber } = clickData;
      onDataBlockClick(blockWithoutNodeNumber);
    }
  };

  const handleSchemaListHover = (block) => {
    if (block) {
      setSelectedBlock(block);
      setSelectedBlockId(block.value || block.subType);
    }
  };

  const renderNestedVariables = () => {
    const variablesData = allFxDataBlocks[VARIABLES];
    if (!variablesData) return null;
    
    const nodeVars = variablesData[NODE_VARIABLES] || [];
    if (nodeVars.length === 0) return null;
    
    const processedNodes = processNodeVariablesForSchemaList(nodeVars);
    
    return (
      <div className={classes.nestedVariables}>
        {processedNodes.map((node, index) => (
          <SchemaListV3
            key={`${node.key}_${index}`}
            node={node}
            parentKey={node.key}
            onClick={handleSchemaListClick}
            onHover={handleSchemaListHover}
            hoveredBlockId={selectedBlockId}
            isVerbose={isVerbose}
            defaultExpanded={false}
            showArrayStructure={showArrayStructure}
          />
        ))}
      </div>
    );
  };

  const renderBlocksList = () => {
    const allBlocks = getAllVisibleBlocks;
    
    if (filteredDataBlocks) {
      const results = getSearchResults();
      if (results.length === 0) {
        return (
          <div className={classes.noResults}>
            No results for "{searchText}"
          </div>
        );
      }
      return (
        <div className={classes.blocksList} ref={blocksListRef}>
          {results.map((block, index) => {
            const blockId = getBlockId(block);
            const isHighlighted = highlightedIndex === index || (highlightedIndex < 0 && isBlockSelected(block));
            return (
              <DataBlockV3
                key={`search-${blockId}-${index}`}
                block={block}
                onClick={handleBlockClick}
                onHover={handleBlockSelect}
                isHovered={isHighlighted}
                dataBlockId={blockId}
              />
            );
          })}
        </div>
      );
    }

    let globalIndex = 0;
    return (
      <div className={classes.blocksList} ref={blocksListRef}>
        {categories.map((category) => {
          if (category === VARIABLES && hasNestedSchema(allFxDataBlocks[VARIABLES])) {
            const categoryBlocks = getBlocksForCategory(category)
              .filter(block => block.subCategory !== NODE_VARIABLES);
            
            return (
              <div key={category} className={classes.categorySection}>
                <div className={classes.categoryHeader}>
                  <span className={classes.categoryIcon}>{CATEGORY_ICONS[category]}</span>
                  <span className={classes.categoryLabel}>{CATEGORY_LABELS[category]}</span>
                </div>
                {renderNestedVariables()}
                {categoryBlocks.map((block, index) => {
                  const blockId = getBlockId(block);
                  const currentIndex = globalIndex++;
                  const isHighlighted = highlightedIndex === currentIndex || (highlightedIndex < 0 && isBlockSelected(block));
                  return (
                    <DataBlockV3
                      key={`${category}-${blockId}-${index}`}
                      block={{ ...block, nodeNumber: index + 1 }}
                      onClick={handleBlockClick}
                      onHover={handleBlockSelect}
                      isHovered={isHighlighted}
                      dataBlockId={blockId}
                    />
                  );
                })}
              </div>
            );
          }
          
          const blocks = getBlocksForCategory(category);
          if (blocks.length === 0) return null;
          
          return (
            <div key={category} className={classes.categorySection}>
              <div className={classes.categoryHeader}>
                <span className={classes.categoryIcon}>{CATEGORY_ICONS[category]}</span>
                <span className={classes.categoryLabel}>{CATEGORY_LABELS[category]}</span>
              </div>
              {blocks.map((block, index) => {
                const blockId = getBlockId(block);
                const currentIndex = globalIndex++;
                const isHighlighted = highlightedIndex === currentIndex || (highlightedIndex < 0 && isBlockSelected(block));
                return (
                  <DataBlockV3
                    key={`${category}-${blockId}-${index}`}
                    block={{ ...block, nodeNumber: index + 1 }}
                    onClick={handleBlockClick}
                    onHover={handleBlockSelect}
                    isHovered={isHighlighted}
                    dataBlockId={blockId}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderFunctionSignature = (block) => {
    const args = block?.args || [];
    const displayName = block?.displayValue || block?.name || block?.value;
    
    if (args.length === 0) {
      return `${displayName}()`;
    }
    
    const argStrings = args.map(arg => {
      const name = arg.name || 'value';
      return arg.required ? name : `[${name}]`;
    });
    
    return `${displayName}(${argStrings.join(', ')})`;
  };

  const renderArgumentsList = (args) => {
    if (!args || args.length === 0) return null;
    
    return (
      <div className={classes.argumentsSection}>
        <div className={classes.argumentsTitle}>Arguments</div>
        {args.map((arg, idx) => (
          <div key={idx} className={classes.argumentItem}>
            <div className={classes.argumentHeader}>
              <span className={classes.argumentName}>{arg.name || `arg${idx + 1}`}</span>
              <span className={classes.argumentType}>{arg.type || 'any'}</span>
              {arg.required && <span className={classes.requiredBadge}>required</span>}
              {!arg.required && <span className={classes.optionalBadge}>optional</span>}
            </div>
            {arg.description && (
              <div className={classes.argumentDescription}>{arg.description}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderDetailPanel = () => {
    const block = selectedBlock;
    const returnType = block?.returnType;
    const description = block?.description;
    const displayName = block?.displayValue || block?.name || block?.value;
    const examples = block?.examples || [];
    const args = block?.args || [];
    
    if (!block) {
      return (
        <div className={classes.detailPanel}>
          <div className={classes.emptyDetailState}>
            Hover over a function or variable to see details
          </div>
        </div>
      );
    }
    
    const isVariable = block.type === NODE_VARIABLES || block.subCategory === NODE_VARIABLES;
    
    return (
      <div className={classes.detailPanel}>
        <div className={classes.detailHeader}>
          {returnType && (
            <span className={classes.typeBadge}>{returnType}</span>
          )}
          <span className={classes.functionName}>{displayName}</span>
        </div>

        {description && (
          <div 
            className={classes.descriptionText}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
          />
        )}

        {block.subCategory === 'FUNCTIONS' && (
          <div className={classes.signatureSection}>
            <div className={classes.signatureTitle}>Syntax</div>
            <code className={classes.signatureCode}>{renderFunctionSignature(block)}</code>
          </div>
        )}

        {isVariable && (
          <div className={classes.variableInfoSection}>
            <div className={classes.variableInfoRow}>
              <span className={classes.variableInfoLabel}>Type</span>
              <span className={classes.variableInfoValue}>{block.returnType || block.variableData?.type || 'any'}</span>
            </div>
            {block.variableData?.path && block.variableData.path.length > 0 && (
              <div className={classes.variableInfoRow}>
                <span className={classes.variableInfoLabel}>Path</span>
                <span className={classes.variableInfoValue}>{block.variableData.path.join('.')}</span>
              </div>
            )}
            {block.variableData?.default !== undefined && (
              <div className={classes.variableInfoRow}>
                <span className={classes.variableInfoLabel}>Default</span>
                <span className={classes.variableInfoValue}>
                  {typeof block.variableData.default === 'object' 
                    ? JSON.stringify(block.variableData.default) 
                    : String(block.variableData.default)}
                </span>
              </div>
            )}
          </div>
        )}

        {renderArgumentsList(args)}

        {examples.length > 0 && (
          <div className={classes.examplesSection}>
            <div className={classes.examplesTitle}>Examples</div>
            {examples.map((example, idx) => (
              <div key={idx} className={classes.exampleItem}>
                <div className={classes.exampleFormula}>{example.formula}</div>
                <div className={classes.exampleResult}>= {example.result}</div>
              </div>
            ))}
          </div>
        )}

        {examples.length === 0 && block.value && block.subCategory === 'FUNCTIONS' && (
          <div className={classes.examplesSection}>
            <div className={classes.examplesTitle}>Examples</div>
            <div className={classes.exampleItem}>
              <div className={classes.exampleFormula}>{renderFunctionSignature(block)}</div>
              <div className={classes.exampleResult}>= {returnType || 'any'}</div>
            </div>
          </div>
        )}

        {isVariable && (
          <div className={classes.variableUsageSection}>
            <div className={classes.examplesTitle}>Usage</div>
            <div className={classes.exampleItem}>
              <div className={classes.exampleFormula}>{displayName}</div>
              <div className={classes.exampleResult}>Returns {block.returnType || 'value'}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const makeReadable = (msg) => {
    if (!msg) return '';
    const str = typeof msg === 'string' ? msg : String(msg);
    return str
      .replace(/\bargument (\d+)/gi, 'the $1st/nd/rd/th argument')
      .replace(/the 1st\/nd\/rd\/th/g, 'the first')
      .replace(/the 2st\/nd\/rd\/th/g, 'the second')
      .replace(/the 3st\/nd\/rd\/th/g, 'the third')
      .replace(/\bmay be null\b/g, 'might be empty')
      .replace(/\bnull\b/g, 'empty')
      .replace(/\bfailed because\b/g, 'has an issue:');
  };

  const getUniqueMessages = (errors, diagnostics) => {
    const seen = new Set();
    const unique = [];
    
    const normalizeError = (e) => {
      if (typeof e === 'string') return { message: e };
      if (e && typeof e === 'object' && e.message) return e;
      if (e && typeof e === 'object') {
        return { message: JSON.stringify(e) };
      }
      return { message: String(e || '') };
    };
    
    const allItems = [
      ...errors.map(e => normalizeError(e)),
      ...diagnostics.filter(d => d.severity === 'error').map(d => normalizeError(d))
    ];
    
    allItems.forEach(item => {
      const key = item.message;
      if (key && !seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });
    
    return unique;
  };

  const allErrors = getUniqueMessages(validationErrors, validationDiagnostics);
  const allWarnings = validationDiagnostics
    .filter(d => d.severity === 'warning')
    .filter((w, i, arr) => arr.findIndex(x => x.message === w.message) === i);

  const formatErrorMessage = (err) => {
    const rawMessage = err.message || err;
    const message = makeReadable(rawMessage);
    return { message };
  };

  return (
    <div className={classes.popperContainer}>
      <div className={classes.popperHeader}>
        <div className={classes.headerLeft}>
          <span className={classes.popperTitle}>Functions</span>
          <span className={classes.helpIcon} title="Formula help">?</span>
        </div>
        <div className={classes.headerRight}>
          <button 
            className={classes.closeButton} 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>

      {showAIAssistant && (
        <AIAssistant
          variables={variables}
          onFormulaGenerated={onAIFormulaGenerated}
          onClose={onClose}
        />
      )}

      <div className={classes.debugModeRow}>
        <div className={classes.debugToggleContainer}>
          <span className={classes.debugLabel}>Debug mode</span>
          <Switch
            checked={debugMode}
            onChange={(e) => onDebugModeChange(e.target.checked)}
            size="small"
          />
        </div>
      </div>
      
      {debugMode && (allErrors.length > 0 || allWarnings.length > 0) && (
        <div className={classes.validationBanner}>
          {allErrors.map((err, idx) => {
            const { message } = formatErrorMessage(err);
            return (
              <div key={`err-${idx}`} className={classes.errorMessage}>
                {message}
              </div>
            );
          })}
          {allWarnings.map((warn, idx) => {
            const { message } = formatErrorMessage(warn);
            return (
              <div key={`warn-${idx}`} className={classes.warningMessage}>
                {message}
              </div>
            );
          })}
        </div>
      )}

      <div className={classes.body}>
        <div className={classes.leftPanel}>
          {renderBlocksList()}
        </div>
        <div className={classes.rightPanel}>
          {renderDetailPanel()}
        </div>
      </div>
    </div>
  );
});

export default FxPopperV3;
