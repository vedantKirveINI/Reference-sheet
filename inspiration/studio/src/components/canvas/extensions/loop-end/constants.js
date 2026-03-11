import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const LOOP_END_TYPE = "LOOP_END";

export const LOOP_END_NODE = {
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742543022007/aggregrator.svg",
  name: "Loop End",
  type: LOOP_END_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#EA580C",
  foreground: "#fff",
  dark: "#C2410C",
  light: "#EA580C",
  hasTestModule: true,
  isPaired: true,
  pairedType: "LOOP_START",
};

export const THEME = {
  primaryButtonBg: "#C2410C",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(234, 88, 12, 0.08)",
  iconBorder: "rgba(234, 88, 12, 0.15)",
  iconColor: "#EA580C",
};

export const TABS = {
  CONFIGURE: "configure",
  TEST: "test",
};

export const RESULT_MODES = [
  { id: "collect_all", label: "Save everything as a list", description: "Grab data from every loop run and save it as a list", icon: "Layers" },
  { id: "aggregate", label: "Crunch the numbers", description: "Calculate totals, averages, or find the highest and lowest values", icon: "Calculator" },
  { id: "no_output", label: "No output needed", description: "Just run the loop — don't collect any results", icon: "EyeOff" },
];

export const LOOP_END_NAMES = {
  LOOP_START: { name: "Loop End", description: "Collects results from each round of the loop" },
  FOR_EACH: { name: "For Each End", description: "Collects results from each item in the list" },
  REPEAT: { name: "Repeat End", description: "Collects results from each repetition" },
  LOOP_UNTIL: { name: "Loop Until End", description: "Collects results until the condition is met" },
};

export const getLoopEndName = (startType) => LOOP_END_NAMES[startType] || LOOP_END_NAMES.LOOP_START;

export const AGGREGATE_OPERATIONS = [
  { id: "sum", label: "Sum", description: "Add up all values" },
  { id: "min", label: "Min", description: "Find the smallest value" },
  { id: "max", label: "Max", description: "Find the largest value" },
  { id: "average", label: "Average", description: "Calculate the average" },
  { id: "count", label: "Count", description: "Count how many" },
];
