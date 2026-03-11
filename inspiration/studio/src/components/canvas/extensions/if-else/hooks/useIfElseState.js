import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { uniqueId } from "lodash";

const createEmptyCondition = () => ({
  id: uniqueId("cond_"),
  field: { type: "fx", blocks: [] },
  fieldStr: "",
  operator: { key: "=", value: "equals" },
  value: { type: "fx", blocks: [] },
  valueStr: "",
});

const createEmptyGroup = () => ({
  id: uniqueId("group_"),
  conjunction: "and",
  conditions: [createEmptyCondition()],
  groups: [],
});

const createIfBlock = () => {
  const id = uniqueId("block_");
  return {
    id,
    type: "if",
    conditionGroup: createEmptyGroup(),
    moveTo: null,
  };
};

const createElseBlock = () => {
  const id = uniqueId("block_");
  return {
    id,
    type: "else",
    conditionGroup: null,
    moveTo: null,
  };
};

// Create ifData entry from a block to keep them in sync
const blockToIfDataEntry = (block) => ({
  key: block.id,
  id: block.id,
  conditionGroup: block.conditionGroup,
  condition: null, // Will be computed by IfElseComposer when needed
  conditionStr: "",
  jumpTo: block.moveTo || null,
});

/**
 * Get condition items from a group. Supports both shapes:
 * - conditions/groups (useIfElseState legacy): conditionGroup.conditions
 * - childs (ConditionComposerV2): conditionGroup.childs
 */
const getConditionItems = (conditionGroup) =>
  conditionGroup?.conditions ?? conditionGroup?.childs ?? [];

/**
 * Check if a leaf condition item is empty. Supports both shapes:
 * - conditions: c.field?.blocks
 * - childs: child.field or child.key (ConditionComposerV2)
 */
const isLeafConditionEmpty = (item) => {
  if (!item) return true;
  // conditions shape: field.blocks
  if (item.field && typeof item.field === "object" && Array.isArray(item.field.blocks)) {
    return !item.field.blocks.length;
  }
  // ConditionComposerV2 (childs) shape: field or key
  return !item.field && !item.key;
};

/**
 * Check if any leaf in the condition tree has an empty field. Recurses into childs/groups.
 */
const hasEmptyFieldInGroup = (items) => {
  if (!items || items.length === 0) return true;
  return items.some((item) => {
    // Nested group: childs shape (ConditionComposerV2) or groups shape (conditions)
    if (item.childs && item.childs.length > 0) {
      return hasEmptyFieldInGroup(item.childs);
    }
    if (item.groups && item.groups.length > 0) {
      return item.groups.some((g) => hasEmptyFieldInGroup(getConditionItems(g)));
    }
    return isLeafConditionEmpty(item);
  });
};

/**
 * Pure function: compute validation result from composer data.
 * Supports both conditionGroup.conditions and conditionGroup.childs shapes.
 */
const computeValidationFromData = (data) => {
  const errors = [];

  if (!data?.blocks || data.blocks.length === 0) {
    if (!data?.ifData || data.ifData.length === 0) {
      errors.push("At least one condition block is required");
      return { isValid: false, errors };
    }
  }

  const blocks = data.blocks || [];
  const ifBlocks = blocks.filter((b) => b.type === "if" || b.type === "else_if");

  ifBlocks.forEach((block, index) => {
    const blockLabel = index === 0 ? "IF" : `ELSE-IF ${index}`;
    const items = getConditionItems(block.conditionGroup);

    if (items.length === 0) {
      errors.push(`${blockLabel} block must have at least one condition`);
    } else {
      const hasEmptyField = hasEmptyFieldInGroup(items);
      if (hasEmptyField) {
        errors.push(`${blockLabel} block has conditions with empty fields`);
      }
    }
  });

  return { isValid: errors.length === 0, errors };
};

/**
 * Returns default go_data for a new IF Else node (blocks, ifData, elseData).
 * Used when inserting IF Else between two nodes so the two branch links can be created.
 */
export const getDefaultIfElseGoData = () => {
  const defaultIfBlock = createIfBlock();
  const defaultElseBlock = createElseBlock();
  return {
    blocks: [defaultIfBlock, defaultElseBlock],
    ifData: [
      {
        ...blockToIfDataEntry(defaultIfBlock),
        conditionStr: "Statement 1",
      },
    ],
    elseData: [
      { key: defaultElseBlock.id, conditionStr: "ELSE", jumpTo: null },
    ],
  };
};

/**
 * Pure function: build initial composer data from initialData (same logic as hook initial state).
 * Exported so IfElse can sync from diagram's latest go_data when drawer opens.
 */
export const getInitialComposerData = (initialData) => {
  if (initialData.blocks && initialData.blocks.length > 0) {
    return {
      blocks: initialData.blocks,
      ifData: initialData.ifData || [],
      elseData: initialData.elseData || [],
    };
  }
  if (initialData.ifData && initialData.ifData.length > 0) {
    return {
      blocks: null,
      ifData: initialData.ifData,
      elseData: initialData.elseData || [],
    };
  }
  const defaultIfBlock = createIfBlock();
  const defaultElseBlock = createElseBlock();
  return {
    blocks: [defaultIfBlock, defaultElseBlock],
    ifData: [
      {
        ...blockToIfDataEntry(defaultIfBlock),
        conditionStr: "Statement 1",
      },
    ],
    elseData: [
      { key: defaultElseBlock.id, conditionStr: "ELSE", jumpTo: null },
    ],
  };
};

export const useIfElseState = (initialData = {}, open = true) => {
  const [name, setName] = useState(initialData.name || "If-Else");

  const [composerData, setComposerData] = useState(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[useIfElseState] Initial state from initialData", {
        hasBlocks: !!(initialData.blocks && initialData.blocks.length > 0),
        blocksLength: initialData.blocks?.length ?? 0,
        hasIfData: !!(initialData.ifData && initialData.ifData.length > 0),
        ifDataLength: initialData.ifData?.length ?? 0,
        hasElseData: !!(initialData.elseData && initialData.elseData.length > 0),
        firstBlockConditionGroup: initialData.blocks?.[0]?.conditionGroup
          ? "present"
          : "missing",
        firstIfDataConditionGroup: initialData.ifData?.[0]?.conditionGroup
          ? "present"
          : "missing",
      });
    }
    return getInitialComposerData(initialData);
  });

  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);
  const [validation, setValidation] = useState(() =>
    computeValidationFromData(getInitialComposerData(initialData))
  );

  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      const synced = getInitialComposerData(initialData);
      setComposerData(synced);
      setValidation(computeValidationFromData(synced));
    }
    prevOpenRef.current = open;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- sync when drawer opens; initialData read at that time

  const computeValidation = useCallback((data) => computeValidationFromData(data), []);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.composerData !== undefined) {
      setComposerData(updates.composerData);
      setValidation(computeValidation(updates.composerData));
    }
  }, [computeValidation]);

  const updateComposerData = useCallback((data) => {
    setComposerData(data);
    setValidation(computeValidation(data));
  }, [computeValidation]);

  const getData = useCallback(() => {
    return {
      name,
      blocks: composerData.blocks,
      ifData: composerData.ifData,
      elseData: composerData.elseData,
      output_schema: outputSchema,
    };
  }, [name, composerData, outputSchema]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    updateState,
    composerData,
    updateComposerData,
    outputSchema,
    setOutputSchema,
    validation,
    setValidation,
    getData,
    getError,
  };
};
