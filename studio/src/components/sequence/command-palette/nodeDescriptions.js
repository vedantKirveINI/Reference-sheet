import { SEQUENCE_NODE_TYPES } from "../constants";
import extensionIcons from "@/components/canvas/assets/extensions";

export const SEQUENCE_NODE_DESCRIPTIONS = {
  [SEQUENCE_NODE_TYPES.TRIGGER]: {
    id: SEQUENCE_NODE_TYPES.TRIGGER,
    title: "Trigger",
    tagline: "Start the sequence",
    description: "The entry point for your sequence. Define how and when the sequence should begin — via webhook, schedule, or manual trigger.",
    icon: "Play",
    _src: "https://cdn-v1.tinycommand.com/1234567890/1749475877233/trigger-setup.svg",
    category: "trigger",
    keywords: ["start", "begin", "trigger", "webhook", "schedule", "cron", "initiate"],
    hidden: true,
  },
  [SEQUENCE_NODE_TYPES.TINY_MODULE]: {
    id: SEQUENCE_NODE_TYPES.TINY_MODULE,
    title: "Tiny Module",
    tagline: "Reusable mini-workflow",
    description: "A self-contained, reusable unit of work. Encapsulate common actions into modules that can be shared across sequences.",
    icon: "Box",
    _src: extensionIcons.workflowSetupIcon,
    category: "action",
    keywords: ["module", "workflow", "action", "reusable", "component", "block", "function"],
  },
  [SEQUENCE_NODE_TYPES.WAIT]: {
    id: SEQUENCE_NODE_TYPES.WAIT,
    title: "Wait",
    tagline: "Long-duration pause",
    description: "Pause the sequence for hours, days, or weeks. Perfect for drip campaigns, follow-up schedules, or waiting until a specific date.",
    icon: "CalendarClock",
    _src: "https://cdn-v1.tinycommand.com/1234567890/1749475877234/calendar-clock.svg",
    category: "flow",
    keywords: ["wait", "pause", "time", "schedule", "timer", "sleep", "duration", "days", "weeks", "hours"],
  },
  [SEQUENCE_NODE_TYPES.CONDITIONAL]: {
    id: SEQUENCE_NODE_TYPES.CONDITIONAL,
    title: "Conditional",
    tagline: "If-else branching",
    description: "Branch your sequence based on conditions. Route execution paths depending on data values or previous outcomes.",
    icon: "GitBranch",
    _src: "https://cdn-v1.tinycommand.com/1234567890/1742541487770/Ifelse.svg",
    category: "flow",
    keywords: ["if", "else", "condition", "branch", "logic", "decision", "switch", "route"],
  },
  [SEQUENCE_NODE_TYPES.EXIT]: {
    id: SEQUENCE_NODE_TYPES.EXIT,
    title: "Exit",
    tagline: "Terminate sequence early",
    description: "End the sequence before completion. Use when goals are achieved, errors occur, or the sequence should stop.",
    icon: "LogOut",
    _src: extensionIcons.endIcon,
    category: "flow",
    keywords: ["exit", "stop", "end", "terminate", "abort", "finish", "complete"],
  },
  [SEQUENCE_NODE_TYPES.HITL]: {
    id: SEQUENCE_NODE_TYPES.HITL,
    title: "Human in the Loop",
    tagline: "Pause for human action",
    description: "Wait for human intervention before continuing. Create approval workflows or manual review steps in your automation.",
    icon: "User",
    _src: "https://cdn-v1.tinycommand.com/1234567890/1745997356118/Human%20in%20the%20loop%20icon.svg",
    category: "action",
    keywords: ["human", "manual", "approval", "review", "task", "intervention", "hitl", "pause"],
  },
  [SEQUENCE_NODE_TYPES.MERGE_JOIN]: {
    id: SEQUENCE_NODE_TYPES.MERGE_JOIN,
    title: "Merge / Join",
    tagline: "Branch convergence",
    description: "Bring multiple execution paths back together. Synchronize branches after conditional splits.",
    icon: "GitMerge",
    _src: extensionIcons.connectionIcon,
    category: "flow",
    keywords: ["merge", "join", "converge", "sync", "combine", "unite", "branch"],
  },
  [SEQUENCE_NODE_TYPES.LOOP_START]: {
    id: SEQUENCE_NODE_TYPES.LOOP_START,
    title: "Loop",
    tagline: "Recurring pattern",
    description: "Create a repeating section in your sequence. Nodes between Loop Start and Loop End will repeat based on count, condition, or indefinitely.",
    icon: "Repeat",
    _src: extensionIcons.repeaterIcon,
    category: "flow",
    keywords: ["loop", "repeat", "recurring", "cycle", "iterate", "again", "recurrence", "interval"],
    isPaired: true,
    pairedWith: SEQUENCE_NODE_TYPES.LOOP_END,
  },
  [SEQUENCE_NODE_TYPES.LOOP_END]: {
    id: SEQUENCE_NODE_TYPES.LOOP_END,
    title: "Loop End",
    tagline: "End of loop section",
    description: "Marks the end of a loop section. This node is automatically added with Loop Start.",
    icon: "Repeat",
    _src: extensionIcons.repeaterIcon,
    category: "flow",
    keywords: ["loop", "end", "repeat", "close"],
    isPaired: true,
    pairedWith: SEQUENCE_NODE_TYPES.LOOP_START,
    hidden: true,
  },
};

export const getSequenceNodeDescription = (nodeType) => {
  return SEQUENCE_NODE_DESCRIPTIONS[nodeType] || null;
};

export const getSequenceNodesByCategory = (category) => {
  return Object.values(SEQUENCE_NODE_DESCRIPTIONS).filter(
    (node) => node.category === category
  );
};

export const searchSequenceNodes = (query) => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) {
    return Object.values(SEQUENCE_NODE_DESCRIPTIONS);
  }
  
  return Object.values(SEQUENCE_NODE_DESCRIPTIONS).filter((node) => {
    const searchableText = [
      node.title,
      node.tagline,
      node.description,
      ...node.keywords,
    ].join(" ").toLowerCase();
    
    return searchableText.includes(lowerQuery);
  });
};
