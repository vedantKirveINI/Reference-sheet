/**
 * Common target resolver for natural-language node actions.
 * Resolver order: focused node → exact key → exact name/type → fuzzy → ambiguous/missing (with suggestions when typo/low-confidence).
 * @returns {{ status: 'resolved'|'ambiguous'|'missing', nodeKey?: string, candidates?: Array<{ key: string, name?: string, type?: string }>, reason?: string, suggestions?: string[] }}
 */

const PRONOUN_ANCHORS = new Set(["this", "that", "selected", "current", "it", "the selected node", "the current node"]);

const MAX_SUGGESTIONS = 5;
const MIN_SIMILARITY_FOR_SUGGESTION = 0.3;

/** Levenshtein distance (no deps). */
function levenshtein(a, b) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/** Similarity 0..1 (1 = exact). Uses label length to avoid short-string noise. */
function similarity(hint, label) {
  if (!label || !hint) return 0;
  const a = hint.toLowerCase();
  const b = label.toLowerCase();
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length, 1);
  const dist = levenshtein(a, b);
  return 1 - dist / maxLen;
}

function isPronounHint(hint) {
  if (!hint || typeof hint !== "string") return false;
  return PRONOUN_ANCHORS.has(hint.trim().toLowerCase());
}

/** Collect all type-like values from a node (type, subType, go_data.type) for matching. */
function getNodeTypeCandidates(n) {
  const types = new Set();
  const t = (n.type || "").toString().toUpperCase().trim();
  const st = (n.subType || "").toString().toUpperCase().trim();
  const gdType = (n.go_data?.type || "").toString().toUpperCase().trim();
  if (t) types.add(t);
  if (st) types.add(st);
  if (gdType) types.add(gdType);
  return Array.from(types);
}

/** Collect all label-like values from a node (name, text, description, go_data label/question/settings.label). */
function getNodeLabelCandidates(n) {
  const labels = [];
  if (n.name && typeof n.name === "string") labels.push(n.name.trim().toLowerCase());
  if (n.text && typeof n.text === "string") labels.push(n.text.trim().toLowerCase());
  if (n.description && typeof n.description === "string") labels.push(n.description.trim().toLowerCase());
  const gd = n.go_data;
  if (gd && typeof gd === "object") {
    if (gd.label && typeof gd.label === "string") labels.push(gd.label.trim().toLowerCase());
    if (gd.question && typeof gd.question === "string") labels.push(gd.question.trim().toLowerCase());
    const settings = gd.settings;
    if (settings && typeof settings === "object" && settings.label && typeof settings.label === "string") {
      labels.push(settings.label.trim().toLowerCase());
    }
  }
  return labels.filter(Boolean);
}

/** Normalize hint for type matching (e.g. "short text" -> SHORT_TEXT). Use real internal types (MCQ, SCQ, etc.). */
const HINT_TO_TYPE = {
  short_text: "SHORT_TEXT",
  "short text": "SHORT_TEXT",
  long_text: "LONG_TEXT",
  "long text": "LONG_TEXT",
  email: "EMAIL",
  number: "NUMBER",
  date: "DATE",
  time: "TIME",
  dropdown: "DROP_DOWN",
  "single choice": "SCQ",
  "multiple choice": "MCQ",
  welcome: "WELCOME",
  ending: "ENDING",
  phone: "PHONE_NUMBER",
  "phone number": "PHONE_NUMBER",
  zip: "ZIP_CODE",
  "zip code": "ZIP_CODE",
  "file picker": "FILE_PICKER",
  signature: "SIGNATURE",
  address: "ADDRESS",
  currency: "CURRENCY",
  rating: "RATING",
  slider: "SLIDER",
  "opinion scale": "OPINION_SCALE",
  "yes no": "YES_NO",
  "yes/no": "YES_NO",
  "thank you": "ENDING",
  "welcome screen": "WELCOME",
  "ending screen": "ENDING",
  "http request": "HTTP",
  "http": "HTTP",
  transformer: "TRANSFORMER_V3",
  "data transformer": "TRANSFORMER_V3",
  "if else": "IFELSE_V2",
  "if/else": "IFELSE_V2",
  logger: "LOG_V2",
  "jump to": "JUMP_TO",
};

/**
 * Resolve which node the user is referring to.
 * @param {object} options
 * @param {object} [options.diagram] - GoJS diagram with model.nodeDataArray
 * @param {object} [options.workflowContext] - { nodes?, focusedNode? }
 * @param {string} [options.targetHint] - User phrase (e.g. "short text", "this", node name)
 * @param {string} [options.targetStrategy] - "focused" to prefer focused node when hint is pronoun
 * @returns {{ status: 'resolved'|'ambiguous'|'missing', nodeKey?: string, candidates?: Array<{ key: string, name?: string, text?: string, description?: string, type?: string }> }}
 */
export function resolveActionTarget({ diagram, workflowContext = {}, targetHint, targetStrategy }) {
  const rawNodes = diagram?.model?.nodeDataArray ?? workflowContext?.nodes ?? [];
  if (!rawNodes?.length) {
    return { status: "missing" };
  }

  const hint = targetHint?.trim();
  const useFocused = targetStrategy === "focused" || (hint && isPronounHint(hint));
  const focusedNode = workflowContext?.focusedNode;

  if (useFocused && focusedNode?.key) {
    const exists = rawNodes.some((n) => (n.key || n.id) === focusedNode.key);
    if (exists) {
      return { status: "resolved", nodeKey: focusedNode.key };
    }
  }

  if (!hint) {
    return { status: "missing" };
  }

  const hintLower = hint.toLowerCase();
  const hintAsType = HINT_TO_TYPE[hintLower] || hint.replace(/\s+/g, "_").toUpperCase();

  const exactKeyMatch = rawNodes.find((n) => (n.key || n.id) === hint);
  if (exactKeyMatch) {
    return { status: "resolved", nodeKey: exactKeyMatch.key || exactKeyMatch.id };
  }

  const hintNorm = hintLower.replace(/_/g, " ");
  const exactNameOrTypeMatches = rawNodes.filter((n) => {
    const labels = getNodeLabelCandidates(n);
    const types = getNodeTypeCandidates(n);
    for (const label of labels) {
      if (label === hintLower || label === hint) return true;
    }
    for (const type of types) {
      const typeNorm = type.replace(/_/g, " ");
      if (type === hintAsType || typeNorm === hintNorm) return true;
    }
    return false;
  });

  if (exactNameOrTypeMatches.length === 1) {
    const key = exactNameOrTypeMatches[0].key || exactNameOrTypeMatches[0].id;
    return { status: "resolved", nodeKey: key };
  }
  if (exactNameOrTypeMatches.length > 1) {
    const candidates = exactNameOrTypeMatches.map((n) => ({
      key: n.key || n.id,
      name: n.name || n.text,
      text: n.text,
      description: n.description,
      type: n.type || n.subType,
    }));
    return { status: "ambiguous", candidates };
  }

  const fuzzyMatches = rawNodes.filter((n) => {
    const labels = getNodeLabelCandidates(n);
    const types = getNodeTypeCandidates(n);
    for (const label of labels) {
      if (label.includes(hintLower) || hintLower.includes(label)) return true;
    }
    for (const type of types) {
      const typeNorm = type.replace(/_/g, " ");
      if (typeNorm.includes(hintNorm) || hintNorm.includes(typeNorm)) return true;
    }
    return false;
  });

  if (fuzzyMatches.length === 1) {
    const key = fuzzyMatches[0].key || fuzzyMatches[0].id;
    return { status: "resolved", nodeKey: key };
  }
  if (fuzzyMatches.length > 1) {
    const candidates = fuzzyMatches.map((n) => ({
      key: n.key || n.id,
      name: n.name || n.text,
      text: n.text,
      description: n.description,
      type: n.type || n.subType,
    }));
    return { status: "ambiguous", reason: "ambiguous", candidates };
  }

  // No exact/fuzzy match: compute similarity-based suggestions for typo/low-confidence clarification
  const scored = rawNodes
    .map((n) => {
      const labels = getNodeLabelCandidates(n);
      const types = getNodeTypeCandidates(n);
      const primaryLabel = (n.name || n.text || n.description || n.type || n.subType || labels[0] || types[0] || "").toString().trim();
      if (!primaryLabel) return { node: n, score: 0, label: "" };
      const score = similarity(hintLower, primaryLabel);
      return { node: n, score, label: primaryLabel };
    })
    .filter((x) => x.score >= MIN_SIMILARITY_FOR_SUGGESTION)
    .sort((a, b) => b.score - a.score);

  const seen = new Set();
  const suggestions = [];
  for (const { label } of scored) {
    const name = (label || "").trim();
    if (name && !seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      suggestions.push(name);
      if (suggestions.length >= MAX_SUGGESTIONS) break;
    }
  }

  return {
    status: "missing",
    reason: suggestions.length > 0 ? "low_confidence" : "missing",
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}
