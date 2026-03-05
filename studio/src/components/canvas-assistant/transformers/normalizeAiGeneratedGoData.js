function isPlainObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function toFxValue(input) {
  if (isPlainObject(input) && input.type === "fx" && Array.isArray(input.blocks)) {
    const text = typeof input.text === "string" ? input.text : "";
    const blockStr = typeof input.blockStr === "string" ? input.blockStr : "";
    return {
      ...input,
      type: "fx",
      blocks: input.blocks,
      text: text || blockStr,
      blockStr: blockStr || text,
    };
  }

  if (input == null) {
    return { type: "fx", blocks: [], text: "", blockStr: "" };
  }

  const text = typeof input === "string" ? input : String(input);
  return {
    type: "fx",
    blocks: text ? [{ type: "PRIMITIVES", value: text }] : [],
    text,
    blockStr: text,
  };
}

function normalizeHttpGoData(aiConfig) {
  const cfg = isPlainObject(aiConfig) ? aiConfig : {};

  const methodRaw = cfg.method != null ? String(cfg.method) : "GET";
  const method = methodRaw.toUpperCase();

  const url = toFxValue(cfg.url);

  const headers = Array.isArray(cfg.headers)
    ? cfg.headers
        .filter((h) => isPlainObject(h))
        .map((h) => {
          const key = h.key != null ? String(h.key) : "";
          const valueFx = toFxValue(h.value ?? h.valueStr ?? "");
          const valueStr = typeof h.valueStr === "string" ? h.valueStr : valueFx.text || "";
          return { ...h, key, value: valueFx, valueStr };
        })
    : [];

  const query_params = Array.isArray(cfg.query_params)
    ? cfg.query_params
        .filter((q) => isPlainObject(q))
        .map((q) => {
          const key = q.key != null ? String(q.key) : "";
          const valueFx = toFxValue(q.value ?? q.valueStr ?? "");
          const valueStr = typeof q.valueStr === "string" ? q.valueStr : valueFx.text || "";
          return { ...q, key, value: valueFx, valueStr };
        })
    : [];

  const body = isPlainObject(cfg.body)
    ? cfg.body
    : { type: "none", data: null, sub_type: null };

  const authorization = isPlainObject(cfg.authorization)
    ? cfg.authorization
    : { type: "none", data: null };

  return {
    method,
    url,
    headers,
    query_params,
    body,
    authorization,
    // Make initialization deterministic for the drawer/state hook.
    _templateId: cfg._templateId ?? null,
    _isFromScratch: cfg._isFromScratch ?? true,
  };
}

function normalizeTransformerGoData(aiConfig) {
  const cfg = isPlainObject(aiConfig) ? aiConfig : {};
  const expr = cfg.expression ?? cfg.formula ?? "";
  const content = cfg.content != null ? cfg.content : expr;

  return {
    ...cfg,
    content: toFxValue(content),
  };
}

function normalizeFormulaFxGoData(aiConfig) {
  const cfg = isPlainObject(aiConfig) ? aiConfig : {};
  const expr = cfg.expression ?? cfg.formula ?? "";

  // Formula FX drawer uses data.content as its persisted fxContent object.
  const existing = cfg.content;
  const baseFx = existing != null ? existing : expr;
  const fx = toFxValue(baseFx);

  return {
    ...cfg,
    content: {
      ...fx,
      // Preserve the string form if we have it; harmless if unused.
      ...(typeof expr === "string" && expr.trim() ? { formula: expr } : null),
    },
  };
}

function normalizeLogGoData(aiConfig) {
  const cfg = isPlainObject(aiConfig) ? aiConfig : {};

  const logType = cfg.logType ?? cfg.logLevel ?? "INFO";
  const message = cfg.message ?? cfg.content ?? "";

  return {
    ...cfg,
    logType: String(logType).toUpperCase(),
    content: toFxValue(message),
    _templateId: cfg._templateId ?? null,
    _isFromScratch: cfg._isFromScratch ?? true,
  };
}

/** Operator mapping for IFELSE_V2: AI format -> drawer operation object */
const IFELSE_OPERATOR_MAP = {
  gt: { value: "gt", label: "is greater than", valueInputs: [{ type: "number" }] },
  lt: { value: "lt", label: "is less than", valueInputs: [{ type: "number" }] },
  gte: { value: "gte", label: "is greater than or equal to", valueInputs: [{ type: "number" }] },
  lte: { value: "lte", label: "is less than or equal to", valueInputs: [{ type: "number" }] },
  equals: { value: "equals", label: "equals", valueInputs: [{ type: "string" }] },
  isEmpty: { value: "isEmpty", label: "is empty", valueInputs: [] },
  isNotEmpty: { value: "isNotEmpty", label: "is not empty", valueInputs: [] },
  contains: { value: "contains", label: "contains", valueInputs: [{ type: "string" }] },
  // Symbol aliases (LLM may return ">" instead of "gt")
  ">": { value: "gt", label: "is greater than", valueInputs: [{ type: "number" }] },
  "<": { value: "lt", label: "is less than", valueInputs: [{ type: "number" }] },
  ">=": { value: "gte", label: "is greater than or equal to", valueInputs: [{ type: "number" }] },
  "<=": { value: "lte", label: "is less than or equal to", valueInputs: [{ type: "number" }] },
};

function normalizeIfElseGoData(aiConfig) {
  const cfg = isPlainObject(aiConfig) ? aiConfig : {};
  const rawConditions = cfg.conditions;

  // Already in drawer format (from setupNode or previous normalization)
  if (Array.isArray(rawConditions) && rawConditions.length > 0) {
    const first = rawConditions[0];
    if (first && (first.type === "if" || first.type === "else-if" || first.type === "else")) {
      return { ...cfg, conditions: rawConditions };
    }
  }

  // AI format: { conditions: [{ field, operator, value }] }
  const aiConditions = Array.isArray(rawConditions) ? rawConditions : [];
  if (aiConditions.length === 0) {
    return {
      conditions: [
        {
          id: Date.now(),
          type: "if",
          logicType: "AND",
          conditions: [{ id: Date.now() + 1, operation: IFELSE_OPERATOR_MAP.equals, value: [] }],
          groups: [],
          isAdvanced: false,
        },
        { id: Date.now() + 2, type: "else" },
      ],
    };
  }

  const ifConditions = aiConditions.map((c) => {
    const op = (c.operator || "equals").toLowerCase();
    const operation = IFELSE_OPERATOR_MAP[op] || IFELSE_OPERATOR_MAP.equals;
    const val = c.value;
    const valueArray = Array.isArray(val) ? val : val != null ? [val] : [];
    return {
      id: Date.now() + Math.random() * 1000,
      variable: null,
      operation: { ...operation },
      value: valueArray,
    };
  });

  return {
    ...cfg,
    conditions: [
      {
        id: Date.now(),
        type: "if",
        logicType: "AND",
        conditions: ifConditions,
        groups: [],
        isAdvanced: false,
      },
      { id: Date.now() + 1, type: "else" },
    ],
  };
}

function normalizeJumpToGoData(aiConfig) {
  const cfg = isPlainObject(aiConfig) ? aiConfig : {};

  // Planner-friendly targeting fields that we will attempt to resolve post-create.
  const targetStepKey = cfg.targetStepKey ?? cfg.targetNodeKey ?? null;
  const targetStepName = cfg.targetStepName ?? cfg.targetStepLabel ?? cfg.targetNodeName ?? null;

  const message = cfg.message ?? cfg.message_content ?? cfg.messageContent ?? "";

  return {
    ...cfg,
    // Drawer expects these keys.
    jump_to_id: cfg.jump_to_id ?? null,
    message_content: toFxValue(message),
    // Keep planner fields so we can resolve jump_to_id deterministically after nodes exist.
    ...(targetStepKey ? { targetStepKey: String(targetStepKey) } : null),
    ...(targetStepName ? { targetStepName: String(targetStepName) } : null),
  };
}

export function normalizeAiGeneratedGoData(backendType, aiConfig) {
  const t = String(backendType || "").toUpperCase();
  if (!t) return isPlainObject(aiConfig) ? { ...aiConfig } : {};

  if (t === "HTTP") return normalizeHttpGoData(aiConfig);
  if (t === "TRANSFORMER_V3") return normalizeTransformerGoData(aiConfig);
  if (t === "LOG") return normalizeLogGoData(aiConfig);
  if (t === "JUMP_TO") return normalizeJumpToGoData(aiConfig);
  if (t === "IFELSE_V2") return normalizeIfElseGoData(aiConfig);

  // Default: preserve object as-is.
  return isPlainObject(aiConfig) ? { ...aiConfig } : {};
}

function findJumpTargetKeyByName(nodes, selfKey, name) {
  if (!name) return null;
  const target = String(name).trim();
  if (!target) return null;

  const candidates = nodes
    .filter((n) => n && (n.key || n.id) && (n.key || n.id) !== selfKey)
    .map((n) => ({
      key: n.key || n.id,
      name: (n.name || n.text || "").trim(),
    }))
    .filter((n) => n.name);

  // Prefer exact match.
  const exact = candidates.filter((c) => c.name === target);
  if (exact.length === 1) return exact[0].key;

  // Next: case-insensitive exact match.
  const lower = target.toLowerCase();
  const ciExact = candidates.filter((c) => c.name.toLowerCase() === lower);
  if (ciExact.length === 1) return ciExact[0].key;

  return null;
}

export function resolveJumpToTargetsAfterCreate({ diagram, createdKeys, saveNodeDataHandler }) {
  if (!diagram?.model || !Array.isArray(createdKeys) || createdKeys.length === 0) return;

  const nodes = diagram.model.nodeDataArray || [];

  for (const key of createdKeys) {
    const nodeData = diagram.model.findNodeDataForKey?.(key);
    if (!nodeData) continue;

    const type = nodeData.type || nodeData.subType;
    if (type !== "JUMP_TO") continue;

    const go = isPlainObject(nodeData.go_data) ? nodeData.go_data : {};
    if (go.jump_to_id) continue;

    const desiredKey = go.targetStepKey ? String(go.targetStepKey) : null;
    const desiredName = go.targetStepName ? String(go.targetStepName) : null;

    let resolved = null;

    if (desiredKey && diagram.model.findNodeDataForKey?.(desiredKey)) {
      resolved = desiredKey;
    } else {
      resolved = findJumpTargetKeyByName(nodes, key, desiredName);
    }

    if (!resolved) continue;

    const mergedGo = { ...go, jump_to_id: resolved };

    diagram.startTransaction("resolveJumpTo");
    try {
      diagram.model.setDataProperty(nodeData, "go_data", mergedGo);
      if (typeof saveNodeDataHandler === "function") {
        saveNodeDataHandler(nodeData, mergedGo, {}, false, false);
      }
      diagram.commitTransaction("resolveJumpTo");
    } catch (err) {
      diagram.rollbackTransaction("resolveJumpTo");
    }
  }
}
