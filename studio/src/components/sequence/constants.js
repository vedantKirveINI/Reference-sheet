export const SEQUENCE_NODE_TYPES = {
  TRIGGER: "SEQUENCE_TRIGGER",
  TINY_MODULE: "TINY_MODULE",
  WAIT: "SEQUENCE_WAIT",
  CONDITIONAL: "SEQUENCE_CONDITIONAL",
  EXIT: "SEQUENCE_EXIT",
  HITL: "SEQUENCE_HITL",
  MERGE_JOIN: "SEQUENCE_MERGE_JOIN",
  LOOP_START: "SEQUENCE_LOOP_START",
  LOOP_END: "SEQUENCE_LOOP_END",
};

export const SEQUENCE_NODE_TEMPLATES = {
  TRIGGER: "sequenceTrigger",
  TINY_MODULE: "sequenceTinyModule",
  WAIT: "sequenceWait",
  CONDITIONAL: "sequenceConditional",
  EXIT: "sequenceExit",
  HITL: "sequenceHitl",
  MERGE_JOIN: "sequenceMergeJoin",
  LOOP_START: "sequenceLoopStart",
  LOOP_END: "sequenceLoopEnd",
};

export const SEQUENCE_NODE_COLORS = {
  [SEQUENCE_NODE_TYPES.TRIGGER]: {
    bg: "#E8F5E9",
    border: "#4CAF50",
    accent: "#2E7D32",
  },
  [SEQUENCE_NODE_TYPES.TINY_MODULE]: {
    bg: "#E3F2FD",
    border: "#2196F3",
    accent: "#1565C0",
  },
  [SEQUENCE_NODE_TYPES.WAIT]: {
    bg: "#FFF8E1",
    border: "#FFC107",
    accent: "#F57F17",
  },
  [SEQUENCE_NODE_TYPES.CONDITIONAL]: {
    bg: "#F3E5F5",
    border: "#9C27B0",
    accent: "#6A1B9A",
  },
  [SEQUENCE_NODE_TYPES.EXIT]: {
    bg: "#FFEBEE",
    border: "#F44336",
    accent: "#C62828",
  },
  [SEQUENCE_NODE_TYPES.HITL]: {
    bg: "#E0F7FA",
    border: "#00BCD4",
    accent: "#00838F",
  },
  [SEQUENCE_NODE_TYPES.MERGE_JOIN]: {
    bg: "#ECEFF1",
    border: "#607D8B",
    accent: "#37474F",
  },
  [SEQUENCE_NODE_TYPES.LOOP_START]: {
    bg: "#FFF3E0",
    border: "#FF9800",
    accent: "#E65100",
  },
  [SEQUENCE_NODE_TYPES.LOOP_END]: {
    bg: "#FFF3E0",
    border: "#FF9800",
    accent: "#E65100",
  },
};

export const SEQUENCE_CANVAS_BG = "#FAFCFE";
export const SEQUENCE_ACCENT_COLOR = "#1C3693";
