import FormulaFX from "./FormulaFX.jsx";

export { FormulaFX };
export default FormulaFX;
// Export FormulaBar as alias for FormulaFX for compatibility with oute-ds-formula-bar
export { FormulaFX as FormulaBar };

// Shared components and utils for use in extensions (e.g. IfElse V2 Variable Selector)
export { SchemaList } from "./components/SchemaList.jsx";
export { default as NodeVariableSection } from "./components/NodeVariableSection.jsx";
export { default as DataBlock } from "./components/data-block/DataBlock.jsx";
export {
  processNodeVariablesForSchemaList,
  truncateMiddle,
} from "./utils/fx-utils.jsx";
