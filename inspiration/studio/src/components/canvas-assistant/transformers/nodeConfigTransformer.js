/**
 * Common AI node config transformation layer.
 * Normalizes AI output (config/go_data) into the exact go_data contract expected by node drawers.
 * Canvas-agnostic orchestrator; Form/Workflow adapters provide key mappings.
 */

/** Deep-merge source into target (plain objects only; arrays and primitives from source overwrite). Never mutates inputs. */
function deepMerge(target, source) {
  if (source == null) return target;
  if (typeof source !== "object" || Array.isArray(source)) return source;
  if (typeof target !== "object" || target == null || Array.isArray(target)) return source;
  const out = { ...target };
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    if (
      srcVal != null &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      typeof out[key] === "object" &&
      out[key] != null &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key], srcVal);
    } else {
      out[key] = srcVal;
    }
  }
  return out;
}

/** Form canvas: AI config key -> canonical go_data key. Shared across question types. */
const FORM_ALIAS_MAP = {
  label: "question",
  title: "question",
  question: "question",
  description: "description",
  placeholder: "placeholder",
  required: "settings.required",
  defaultValue: "settings.defaultValue",
  buttonText: "buttonLabel",
  options: "options",
  min: "settings.minChar", // overridden for number types below
  max: "settings.maxChar",
};

/** Question types that use min/max as numeric (settings.min, settings.max). */
const NUMERIC_MIN_MAX_TYPES = new Set([
  "NUMBER",
  "CURRENCY",
  "SLIDER",
  "OPINION_SCALE",
  "RATING",
]);

/** Types that use options array. */
const OPTIONS_TYPES = new Set(["MCQ", "SCQ", "DROP_DOWN", "DROP_DOWN_STATIC", "RANKING", "AUTOCOMPLETE"]);

/** Types that use buttonLabel (WELCOME/ENDING). */
const BUTTON_LABEL_TYPES = new Set(["WELCOME", "ENDING", "QUOTE"]);

/**
 * Normalize AI config into canonical shape for Form question go_data.
 * Returns a plain object; does not mutate input.
 * @param {{ canvasType: string, nodeType: string, aiConfig: object, defaultGoData: object }}
 * @returns {{ normalized: object, warnings: string[] }}
 */
export function normalizeNodeConfig({ canvasType, nodeType, aiConfig, defaultGoData }) {
  const warnings = [];
  if (aiConfig == null || typeof aiConfig !== "object" || Array.isArray(aiConfig)) {
    return { normalized: {}, warnings };
  }
  const type = (nodeType || "").toUpperCase();
  const out = {};
  const raw = { ...aiConfig };

  if (canvasType === "WORKFLOW_CANVAS") {
    const aliasMap = { ...FORM_ALIAS_MAP };
    if (NUMERIC_MIN_MAX_TYPES.has(type)) {
      aliasMap.min = "settings.min";
      aliasMap.max = "settings.max";
    }
    for (const [fromKey, toKey] of Object.entries(aliasMap)) {
      if (!(fromKey in raw)) continue;
      const val = raw[fromKey];
      if (toKey.startsWith("settings.")) {
        const subKey = toKey.slice("settings.".length);
        if (!out.settings) out.settings = {};
        if (fromKey === "required") out.settings[subKey] = Boolean(val);
        else if (typeof val === "boolean" || typeof val === "number" || typeof val === "string") out.settings[subKey] = val;
        else out.settings[subKey] = val;
        delete raw[fromKey];
      } else if (toKey === "question" || toKey === "description" || toKey === "placeholder") {
        out[toKey] = val != null ? String(val) : "";
        delete raw[fromKey];
      } else if (toKey === "buttonLabel") {
        if (BUTTON_LABEL_TYPES.has(type)) {
          out.buttonLabel = val != null ? String(val) : "";
          delete raw[fromKey];
        }
      } else if (toKey === "options") {
        if (OPTIONS_TYPES.has(type) && Array.isArray(val)) {
          out.options = val.map((o) =>
            o != null && typeof o === "object" && (o.label != null || o.value != null)
              ? String(o.label ?? o.value)
              : o != null
                ? String(o)
                : ""
          );
          delete raw[fromKey];
        } else if (OPTIONS_TYPES.has(type) && val != null) {
          out.options = [String(val)];
          warnings.push(`options normalized to array for ${type}`);
          delete raw[fromKey];
        }
      }
    }
    if (raw.question !== undefined && out.question === undefined) out.question = raw.question != null ? String(raw.question) : "";
    if (raw.description !== undefined && out.description === undefined) out.description = raw.description != null ? String(raw.description) : "";
    if (raw.placeholder !== undefined && out.placeholder === undefined) out.placeholder = raw.placeholder != null ? String(raw.placeholder) : "";
    if (raw.settings && typeof raw.settings === "object") {
      out.settings = deepMerge(out.settings || {}, raw.settings);
      delete raw.settings;
    }
    for (const key of Object.keys(raw)) {
      if (key === "required" || key === "label" || key === "title" || key === "defaultValue" || key === "buttonText") continue;
      if (out[key] === undefined) out[key] = raw[key];
    }
  } else {
    return { normalized: { ...aiConfig }, warnings };
  }
  return { normalized: out, warnings };
}

/**
 * Validate normalized config has minimum contract (type, module, settings object).
 * @param {{ canvasType: string, nodeType: string, normalizedConfig: object }}
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateNodeConfig({ canvasType, nodeType, normalizedConfig }) {
  const errors = [];
  if (canvasType !== "WORKFLOW_CANVAS") return { valid: true, errors: [] };
  if (normalizedConfig == null || typeof normalizedConfig !== "object") {
    errors.push("normalizedConfig must be an object");
    return { valid: false, errors };
  }
  if (normalizedConfig.settings != null && (typeof normalizedConfig.settings !== "object" || Array.isArray(normalizedConfig.settings))) {
    errors.push("settings must be an object when present");
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Merge normalized config over default go_data. Never mutates inputs.
 * @param {{ defaultGoData: object, normalizedConfig: object }}
 * @returns {object}
 */
export function mergeNodeConfig({ defaultGoData, normalizedConfig }) {
  if (defaultGoData == null || typeof defaultGoData !== "object") return normalizedConfig && typeof normalizedConfig === "object" ? { ...normalizedConfig } : {};
  if (normalizedConfig == null || typeof normalizedConfig !== "object") return { ...defaultGoData };
  return deepMerge({ ...defaultGoData }, normalizedConfig);
}

/**
 * Apply post-merge invariants so drawer always receives valid shape.
 * @param {object} goData - merged go_data
 * @param {string} nodeType - question type
 * @returns {object}
 */
function applyInvariants(goData, nodeType) {
  if (!goData || typeof goData !== "object") return goData;
  const type = (nodeType || "").toUpperCase();
  const out = { ...goData };
  out.type = type;
  out.module = "Question";
  if (out.settings == null || typeof out.settings !== "object") out.settings = {};
  if (Array.isArray(out.settings)) out.settings = {};
  if (OPTIONS_TYPES.has(type) && !Array.isArray(out.options)) out.options = Array.isArray(goData.options) ? [...goData.options] : [""];
  return out;
}

/**
 * Orchestrator: normalize -> validate -> merge -> invariants.
 * @param {{ canvasType: string, nodeType: string, aiConfig: object, defaultGoData: object }}
 * @returns {{ goData: object, warnings: string[], valid: boolean }}
 */
export function transformNodeConfig({ canvasType, nodeType, aiConfig, defaultGoData }) {
  const defaultCopy = defaultGoData && typeof defaultGoData === "object" ? { ...defaultGoData } : {};
  const { normalized, warnings } = normalizeNodeConfig({ canvasType, nodeType, aiConfig, defaultGoData: defaultCopy });
  const validation = validateNodeConfig({ canvasType, nodeType, normalizedConfig: normalized });
  if (!validation.valid) {
    return { goData: defaultCopy, warnings: [...warnings, ...validation.errors], valid: false };
  }
  const merged = mergeNodeConfig({ defaultGoData: defaultCopy, normalizedConfig: normalized });
  const goData = applyInvariants(merged, nodeType);
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "development" && warnings.length > 0) {
    console.debug("[nodeConfigTransformer]", nodeType, warnings);
  }
  return { goData, warnings, valid: true };
}
