import React, { useState, useCallback, forwardRef, useImperativeHandle, useEffect, useMemo } from "react";
import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConditionBlock, { BLOCK_TYPES, createEmptyGroup } from "./ConditionBlock";
import { uniqueId } from "lodash";

const createIfBlock = () => ({
  id: uniqueId("block_"),
  type: BLOCK_TYPES.IF,
  conditionGroup: createEmptyGroup(),
  moveTo: null,
  annotation: "",
});

const createElseIfBlock = () => ({
  id: uniqueId("block_"),
  type: BLOCK_TYPES.ELSE_IF,
  conditionGroup: createEmptyGroup(),
  moveTo: null,
  annotation: "",
});

const createElseBlock = () => ({
  id: uniqueId("block_"),
  type: BLOCK_TYPES.ELSE,
  conditionGroup: null,
  moveTo: null,
  annotation: "",
});

const OPERATOR_MAP = {
  "=": { type: "OPERATORS", subType: "==" },
  "==": { type: "OPERATORS", subType: "==" },
  "equals": { type: "OPERATORS", subType: "==" },
  "!=": { type: "OPERATORS", subType: "!=" },
  ">": { type: "OPERATORS", subType: ">" },
  "gt": { type: "OPERATORS", subType: ">" },
  "<": { type: "OPERATORS", subType: "<" },
  "lt": { type: "OPERATORS", subType: "<" },
  ">=": { type: "OPERATORS", subType: ">=" },
  "gte": { type: "OPERATORS", subType: ">=" },
  "<=": { type: "OPERATORS", subType: "<=" },
  "lte": { type: "OPERATORS", subType: "<=" },
  "ilike": { type: "FUNCTIONS", subType: "contains", module_name: "text_binary_instance" },
  "contains": { type: "FUNCTIONS", subType: "contains", module_name: "text_binary_instance" },
  "not_ilike": { type: "FUNCTIONS", subType: "notContains", module_name: "text_binary_instance" },
  "startsWith": { type: "FUNCTIONS", subType: "startsWith", module_name: "lodash" },
  "endsWith": { type: "FUNCTIONS", subType: "endsWith", module_name: "lodash" },
  "isEmpty": { type: "FUNCTIONS", subType: "isEmpty", module_name: "others_instance", args_length: 1 },
  "is_null": { type: "FUNCTIONS", subType: "isEmpty", module_name: "others_instance", args_length: 1 },
  "isNotEmpty": { type: "FUNCTIONS", subType: "isNotEmpty", module_name: "others_instance", args_length: 1 },
  "is_not_null": { type: "FUNCTIONS", subType: "isNotEmpty", module_name: "others_instance", args_length: 1 },
  "includes": { type: "FUNCTIONS", subType: "isValueExists", module_name: "others_instance" },
  "hasKey": { type: "FUNCTIONS", subType: "has", module_name: "lodash" },
  "hasKeyValue": { type: "FUNCTIONS", subType: "isMatch", module_name: "lodash" },
  "lengthEq": { type: "FUNCTIONS", subType: "lengthEq", module_name: "others_instance" },
  "lengthGt": { type: "FUNCTIONS", subType: "lengthGt", module_name: "others_instance" },
  "lengthLt": { type: "FUNCTIONS", subType: "lengthLt", module_name: "others_instance" },
  "lengthGte": { type: "FUNCTIONS", subType: "lengthGte", module_name: "others_instance" },
  "lengthLte": { type: "FUNCTIONS", subType: "lengthLte", module_name: "others_instance" },
  "isBetween": { type: "FUNCTIONS", subType: "isBetween", module_name: "arithmetic_instance" },
  "isDateBetween": { type: "FUNCTIONS", subType: "isDateBetween", module_name: "datetime_instance" },
};

const OPERATOR_ENGLISH = {
  "=": "equals",
  "==": "equals",
  "!=": "does not equal",
  ">": "is greater than",
  "<": "is less than",
  ">=": "is at least",
  "<=": "is at most",
  "contains": "contains",
  "ilike": "contains",
  "not_ilike": "does not contain",
  "not_contains": "does not contain",
  "starts_with": "starts with",
  "startsWith": "starts with",
  "ends_with": "ends with",
  "endsWith": "ends with",
  "is_null": "is empty",
  "isEmpty": "is empty",
  "is_not_null": "is not empty",
  "isNotEmpty": "is not empty",
  "in": "is one of",
  "not_in": "is not one of",
};

const conditionGroupToLegacyCondition = (conditionGroup) => {
  if (!conditionGroup) return null;
  
  const result = { type: "fx", blocks: [] };
  
  const childs = conditionGroup.childs || [];
  const conjunction = conditionGroup.condition || "and";
  
  const conjunctionBlock = {
    type: "OPERATORS",
    subType: conjunction.toUpperCase() === "OR" ? "OR" : "AND",
  };
  
  let prevItem = undefined;
  
  childs.forEach((child) => {
    if (child.childs && child.childs.length > 0) {
      const nestedCondition = conditionGroupToLegacyCondition(child);
      if (!nestedCondition?.blocks?.length) return;
      
      if (prevItem) {
        result.blocks.push({ ...conjunctionBlock });
      }
      
      result.blocks.push(nestedCondition);
      prevItem = child;
    } else {
      const opKey = child.operator?.key || "=";
      const opDef = OPERATOR_MAP[opKey] || { type: "OPERATORS", subType: "==" };
      
      if (!child.field && !child.key) return;
      
      if (prevItem) {
        result.blocks.push({ ...conjunctionBlock });
      }
      
      if (opDef.type === "OPERATORS") {
        if (child.key || child.field) {
          result.blocks.push({ type: "PRIMITIVES", value: child.key || child.field });
        }
        result.blocks.push({ type: "OPERATORS", subType: opDef.subType });
        if (child.value !== undefined) {
          const valStr = typeof child.value === "object" && child.value?.blocks?.length > 0
            ? child.value
            : { type: "PRIMITIVES", value: String(child.value || child.valueStr || "") };
          result.blocks.push(valStr);
        }
      } else if (opDef.type === "FUNCTIONS") {
        const funcFx = { type: "fx", blocks: [] };
        funcFx.blocks.push({ type: "FUNCTIONS", subType: opDef.subType, module_name: opDef.module_name });
        funcFx.blocks.push({ type: "OPERATORS", subType: "(" });
        
        if (child.key || child.field) {
          funcFx.blocks.push({ type: "PRIMITIVES", value: child.key || child.field });
        }
        
        if (opDef.args_length !== 1 && child.value !== undefined) {
          funcFx.blocks.push({ type: "OPERATORS", subType: ";" });
          const valStr = typeof child.value === "object" && child.value?.blocks?.length > 0
            ? child.value
            : { type: "PRIMITIVES", value: String(child.value || child.valueStr || "") };
          funcFx.blocks.push(valStr);
        }
        
        funcFx.blocks.push({ type: "OPERATORS", subType: ")" });
        result.blocks.push(funcFx);
      }
      
      prevItem = child;
    }
  });
  
  return result.blocks.length > 0 ? result : null;
};

const getConditionSummary = (group) => {
  if (!group) return "";
  
  const childs = group.childs || [];
  const conjunction = group.condition || "and";
  const parts = [];
  
  childs.forEach(child => {
    if (child.childs && child.childs.length > 0) {
      const nestedSummary = getConditionSummary(child);
      if (nestedSummary) {
        parts.push(`(${nestedSummary})`);
      }
    } else {
      const field = child.label || child.key || child.field || "";
      const opKey = child.operator?.key || "=";
      const opText = OPERATOR_ENGLISH[opKey] || child.operator?.value || opKey;
      const value = typeof child.value === "string" ? child.value : (child.valueStr || "");
      
      if (field) {
        let condStr = `"${field}" ${opText}`;
        if (value && !["is_null", "is_not_null", "isEmpty", "isNotEmpty"].includes(opKey)) {
          condStr += ` "${value}"`;
        }
        parts.push(condStr);
      }
    }
  });
  
  const conjunctionText = conjunction === "or" ? "OR" : "AND";
  return parts.join(` ${conjunctionText} `);
};

const parseInitialData = (initialData) => {
  if (process.env.NODE_ENV === "development") {
    console.log("[IfElseComposer] parseInitialData called", {
      hasInitialData: !!initialData,
      hasBlocks: !!(initialData?.blocks?.length),
      blocksLength: initialData?.blocks?.length ?? 0,
      hasIfData: !!(initialData?.ifData?.length),
      firstBlockConditionGroup: initialData?.blocks?.[0]?.conditionGroup
        ? "present"
        : "missing",
      firstIfDataConditionGroup: initialData?.ifData?.[0]?.conditionGroup
        ? "present"
        : "missing",
    });
  }
  if (!initialData || (!initialData.blocks && !initialData.ifData)) {
    if (process.env.NODE_ENV === "development") {
      console.log("[IfElseComposer] parseInitialData → using default (empty) blocks");
    }
    return [createIfBlock(), createElseBlock()];
  }

  if (initialData.blocks && initialData.blocks.length > 0) {
    const blocks = initialData.blocks.map(block => ({
      ...block,
      id: block.id || uniqueId("block_"),
    }));
    if (!blocks.some(b => b.type === BLOCK_TYPES.ELSE)) {
      blocks.push(createElseBlock());
    }
    return blocks;
  }

  if (initialData.ifData && initialData.ifData.length > 0) {
    const blocks = [];
    
    initialData.ifData.forEach((ifItem, index) => {
      let conditionGroup;
      
      if (ifItem.conditionGroup) {
        conditionGroup = ifItem.conditionGroup;
      } else {
        conditionGroup = createEmptyGroup();
      }

      blocks.push({
        id: ifItem.key || ifItem.id || uniqueId("block_"),
        type: index === 0 ? BLOCK_TYPES.IF : BLOCK_TYPES.ELSE_IF,
        conditionGroup,
        moveTo: ifItem.jumpTo || ifItem.moveTo || null,
        annotation: ifItem.annotation || "",
      });
    });

    if (initialData.elseData && initialData.elseData.length > 0) {
      const elseItem = initialData.elseData[0];
      blocks.push({
        id: elseItem?.key || elseItem?.id || uniqueId("block_"),
        type: BLOCK_TYPES.ELSE,
        conditionGroup: null,
        moveTo: elseItem?.jumpTo || elseItem?.moveTo || null,
        annotation: elseItem?.annotation || "",
      });
    } else {
      blocks.push(createElseBlock());
    }

    return blocks.length > 0 ? blocks : [createIfBlock(), createElseBlock()];
  }

  return [createIfBlock(), createElseBlock()];
};

const IfElseComposer = forwardRef(({
  initialData = {},
  variables = {},
  jumpToNodeOptions = [],
  onChange = () => {},
  onValidationChange = () => {},
  onAddNode,
}, ref) => {
  const DEBUG = process.env.NODE_ENV === 'development';
  
  const [blocks, setBlocks] = useState(() => {
    const parsed = parseInitialData(initialData);
    return parsed;
  });
  const [touchedBlocks, setTouchedBlocks] = useState(new Set());
  const [saveAttempted, setSaveAttempted] = useState(false);

  const pendingNotifyRef = React.useRef(false);
  const isFromPropSyncRef = React.useRef(false);
  const hasInitializedRef = React.useRef(false);
  const lastEmittedSignatureRef = React.useRef('');

  // Create a stable content signature for comparison - ID-AGNOSTIC
  // Excludes block IDs since parseInitialData generates new IDs each time
  // Only compares: block type, moveTo target, and conditionGroup content
  const getContentSignature = React.useCallback((blocksData) => {
    if (!blocksData || !Array.isArray(blocksData) || blocksData.length === 0) return '';
    return blocksData.map((b, index) => {
      // Use deterministic stringification for conditionGroup
      // Sort keys at all levels for stability
      const conditionHash = b.conditionGroup 
        ? JSON.stringify(b.conditionGroup, (key, value) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              return Object.keys(value).sort().reduce((sorted, k) => {
                sorted[k] = value[k];
                return sorted;
              }, {});
            }
            return value;
          })
        : '';
      // Use index instead of b.id for position, compare type, moveTo, and conditions
      return `${index}:${b.type}:${b.moveTo?.key || ''}:${conditionHash}`;
    }).join('|');
  }, []);

  // Set initial signature from parsed initial data
  React.useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const initialBlocks = parseInitialData(initialData);
      lastEmittedSignatureRef.current = getContentSignature(initialBlocks);
    }
  }, []); // Run only once on mount

  useEffect(() => {
    // Skip if not initialized yet
    if (!hasInitializedRef.current) return;
    
    // Parse incoming data to canonical form (handles both blocks and ifData/elseData formats)
    const parsedIncoming = parseInitialData(initialData);
    
    // If no blocks, nothing to sync
    if (!parsedIncoming || parsedIncoming.length === 0) return;

    // Incoming has loaded condition content (childs or conditions) - always apply so saved data is shown
    const firstIfBlock = parsedIncoming.find((b) => b.type === BLOCK_TYPES.IF || b.type === BLOCK_TYPES.ELSE_IF);
    const conditionItems = firstIfBlock?.conditionGroup?.childs ?? firstIfBlock?.conditionGroup?.conditions ?? [];
    const incomingHasConditionContent = conditionItems.length > 0;

    const incomingSignature = getContentSignature(parsedIncoming);
    const signatureMatches = incomingSignature === lastEmittedSignatureRef.current;

    // If incoming matches last emitted and has no loaded condition content, skip (avoid overwriting user edits)
    if (signatureMatches && !incomingHasConditionContent) {
      if (process.env.NODE_ENV === "development") {
        console.log("[IfElseComposer] Sync effect: skipping (incoming === last emitted, no condition content)");
      }
      return;
    }

    // Incoming has condition content (loaded/saved data) or is different - sync so UI shows it
    if (incomingHasConditionContent || !signatureMatches) {
      if (process.env.NODE_ENV === "development") {
        console.log("[IfElseComposer] Sync effect: syncing blocks from initialData", {
          parsedBlocksLength: parsedIncoming.length,
          firstBlockHasConditionGroup: !!parsedIncoming[0]?.conditionGroup,
          incomingHasConditionContent,
        });
      }
      isFromPropSyncRef.current = true;
      lastEmittedSignatureRef.current = incomingSignature;
      setBlocks(parsedIncoming);
    }
  }, [initialData, getContentSignature]);

  const usedJumpToKeys = useMemo(() => {
    const keys = new Set();
    blocks.forEach(block => {
      if (block.moveTo?.key) {
        keys.add(block.moveTo.key);
      }
    });
    return keys;
  }, [blocks]);

  const validateConditionGroup = useCallback((group) => {
    if (!group) return { hasConditions: false, hasEmptyFields: false };
    
    const childs = group.childs || [];
    let hasConditions = false;
    let hasEmptyFields = false;
    
    if (childs.length > 0) {
      childs.forEach(child => {
        if (child.childs && child.childs.length > 0) {
          const nestedResult = validateConditionGroup(child);
          if (nestedResult.hasConditions) hasConditions = true;
          if (nestedResult.hasEmptyFields) hasEmptyFields = true;
        } else {
          hasConditions = true;
          if (!child.field && !child.key) {
            hasEmptyFields = true;
          }
        }
      });
    }
    
    return { hasConditions, hasEmptyFields };
  }, []);

  const validateBlock = useCallback((block) => {
    const errors = [];
    const isElse = block.type === BLOCK_TYPES.ELSE;
    
    if (!isElse) {
      const { hasConditions, hasEmptyFields } = validateConditionGroup(block.conditionGroup);
      
      if (!hasConditions) {
        errors.push("Add at least one condition");
      } else if (hasEmptyFields) {
        errors.push("Some conditions have empty fields");
      }
    }
    
    if (!block.moveTo) {
      errors.push("Select a target node");
    }
    
    return errors;
  }, [validateConditionGroup]);

  const blockErrors = useMemo(() => {
    const errorsMap = {};
    blocks.forEach((block) => {
      errorsMap[block.id] = validateBlock(block);
    });
    return errorsMap;
  }, [blocks, validateBlock]);

  const validate = useCallback(() => {
    const allErrors = [];
    
    blocks.forEach((block, index) => {
      const blockLabel = block.type === BLOCK_TYPES.IF 
        ? "IF" 
        : block.type === BLOCK_TYPES.ELSE_IF 
          ? `ELSE-IF ${index}` 
          : "ELSE";
      
      const errors = blockErrors[block.id] || [];
      errors.forEach(err => {
        allErrors.push(`${blockLabel}: ${err}`);
      });
    });

    return { isValid: allErrors.length === 0, errors: allErrors };
  }, [blocks, blockErrors]);

  const validateBlocks = useCallback((blocksToValidate) => {
    const allErrors = [];
    
    blocksToValidate.forEach((block, index) => {
      const blockLabel = block.type === BLOCK_TYPES.IF 
        ? "IF" 
        : block.type === BLOCK_TYPES.ELSE_IF 
          ? `ELSE-IF ${index}` 
          : "ELSE";
      
      const errors = validateBlock(block);
      errors.forEach(err => {
        allErrors.push(`${blockLabel}: ${err}`);
      });
    });

    return { isValid: allErrors.length === 0, errors: allErrors };
  }, [validateBlock]);

  const notifyParent = useCallback((updatedBlocks) => {
    const validationResult = validateBlocks(updatedBlocks);
    onValidationChange(validationResult);
    
    const ifData = [];
    let elseData = [];

    updatedBlocks.forEach((block) => {
      if (block.type === BLOCK_TYPES.ELSE) {
        elseData = [{
          key: block.id,
          conditionStr: "Else",
          jumpTo: block.moveTo || null,
        }];
      } else {
        ifData.push({
          key: block.id,
          id: block.id,
          conditionGroup: block.conditionGroup,
          condition: conditionGroupToLegacyCondition(block.conditionGroup),
          conditionStr: block.conditionStr || getConditionSummary(block.conditionGroup),
          jumpTo: block.moveTo || null,
        });
      }
    });

    // Track signature of data we're emitting so we can ignore echoes from parent
    lastEmittedSignatureRef.current = getContentSignature(updatedBlocks);
    
    onChange({ blocks: updatedBlocks, ifData, elseData });
  }, [onChange, onValidationChange, validateBlocks, getContentSignature]);

  useEffect(() => {
    if (isFromPropSyncRef.current) {
      isFromPropSyncRef.current = false;
      return;
    }
    if (pendingNotifyRef.current) {
      pendingNotifyRef.current = false;
      notifyParent(blocks);
    }
  }, [blocks, notifyParent]);

  const markBlockTouched = useCallback((blockId) => {
    setTouchedBlocks(prev => {
      if (prev.has(blockId)) return prev;
      const newSet = new Set(prev);
      newSet.add(blockId);
      return newSet;
    });
  }, []);

  const markAllBlocksTouched = useCallback(() => {
    setTouchedBlocks(new Set(blocks.map(b => b.id)));
    setSaveAttempted(true);
  }, [blocks]);

  const blocksNeedingAttention = useMemo(() => {
    return blocks.filter(b => (blockErrors[b.id] || []).length > 0);
  }, [blocks, blockErrors]);

  const handleBlockUpdate = useCallback((index, updatedBlock) => {
    markBlockTouched(updatedBlock.id);
    pendingNotifyRef.current = true;
    setBlocks(prev => {
      const newBlocks = [...prev];
      newBlocks[index] = updatedBlock;
      return newBlocks;
    });
  }, [markBlockTouched]);

  const handleBlockDelete = useCallback((index) => {
    pendingNotifyRef.current = true;
    setBlocks(prev => {
      if (prev.length <= 1) return prev;
      const newBlocks = prev.filter((_, i) => i !== index);
      
      if (newBlocks.length > 0 && newBlocks[0].type !== BLOCK_TYPES.IF) {
        newBlocks[0] = { ...newBlocks[0], type: BLOCK_TYPES.IF };
      }
      
      return newBlocks;
    });
  }, []);

  const handleAddElseIf = useCallback(() => {
    pendingNotifyRef.current = true;
    setBlocks(prev => {
      const elseIndex = prev.findIndex(b => b.type === BLOCK_TYPES.ELSE);
      const newBlock = createElseIfBlock();
      
      let newBlocks;
      if (elseIndex >= 0) {
        newBlocks = [
          ...prev.slice(0, elseIndex),
          newBlock,
          ...prev.slice(elseIndex)
        ];
      } else {
        newBlocks = [...prev, newBlock];
      }
      
      return newBlocks;
    });
  }, []);

  const updateBlockMoveTo = useCallback((blockId, nodeInfo) => {
    pendingNotifyRef.current = true;
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === blockId);
      
      if (idx === -1) {
        if (DEBUG) {
          console.warn('[IfElseComposer.updateBlockMoveTo] Block not found! blockId:', blockId);
        }
        return prev;
      }
      
      const newBlocks = [...prev];
      newBlocks[idx] = { ...newBlocks[idx], moveTo: nodeInfo };
      return newBlocks;
    });
  }, [DEBUG]);

  useImperativeHandle(ref, () => ({
    getData: () => {
      const ifData = [];
      let elseData = [];

      blocks.forEach((block) => {
        if (block.type === BLOCK_TYPES.ELSE) {
          elseData = [{
            key: block.id,
            conditionStr: "Else",
            jumpTo: block.moveTo || null,
            annotation: block.annotation,
          }];
        } else {
          ifData.push({
            key: block.id,
            id: block.id,
            conditionGroup: block.conditionGroup,
            condition: conditionGroupToLegacyCondition(block.conditionGroup),
            conditionStr: block.conditionStr || getConditionSummary(block.conditionGroup),
            jumpTo: block.moveTo || null,
            annotation: block.annotation,
          });
        }
      });

      return { blocks, ifData, elseData };
    },
    validate,
    markAllBlocksTouched,
    updateBlockMoveTo,
  }), [blocks, validate, markAllBlocksTouched, updateBlockMoveTo]);

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <ConditionBlock
          key={block.id}
          block={block}
          blockIndex={index}
          variables={variables}
          jumpToOptions={jumpToNodeOptions}
          usedJumpToKeys={usedJumpToKeys}
          canDelete={block.type !== BLOCK_TYPES.IF && block.type !== BLOCK_TYPES.ELSE}
          onUpdate={(updated) => handleBlockUpdate(index, updated)}
          onDelete={() => handleBlockDelete(index)}
          onAddNode={onAddNode}
          conditionSummary={block.conditionStr || getConditionSummary(block.conditionGroup)}
          validationErrors={touchedBlocks.has(block.id) ? (blockErrors[block.id] || []) : []}
          dataTestId={`condition-block-${index}`}
        />
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddElseIf}
        className="w-full border-dashed border-purple-300 text-purple-600 hover:border-purple-400 hover:bg-purple-50"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Add Else-If Block
      </Button>

      {saveAttempted && blocksNeedingAttention.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>
            {blocksNeedingAttention.length === 1 
              ? "1 block needs a destination" 
              : `${blocksNeedingAttention.length} blocks need attention`}
          </span>
        </div>
      )}
    </div>
  );
});

IfElseComposer.displayName = "IfElseComposer";

export default IfElseComposer;
