import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import TabContainer from "../common-components/TabContainer";
import TRANSFORMER_V2_NODE from "./constant";
import FormulaBarV2 from "@src/module/ods/formula-bar-v2/src/FormulaBarV2";
import classes from "./TransformerV2.module.css";

const ConfigureTab = ({ variables = [], fxContent, setFxContent, onOpenEditor }) => {
  const formulaText = useMemo(() => {
    if (!fxContent?.formula) return null;
    return fxContent.formula;
  }, [fxContent]);

  return (
    <div className={classes.container}>
      <div className={classes.section}>
        <span className={classes.sectionLabel}>Formula</span>
        <div 
          className={classes.formulaPreview}
          onClick={onOpenEditor}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onOpenEditor()}
        >
          {formulaText ? (
            <code>{formulaText}</code>
          ) : (
            <span className={classes.placeholder}>Click to add formula...</span>
          )}
        </div>
        <button className={classes.editButton} onClick={onOpenEditor}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Open Formula Editor
        </button>
      </div>

      {fxContent?.result?.value !== undefined && fxContent?.result?.value !== null && (
        <div className={classes.outputSection}>
          <div className={classes.outputLabel}>Preview Result</div>
          <div className={classes.outputValue}>
            {String(fxContent.result.value)}
          </div>
        </div>
      )}
    </div>
  );
};

const TransformerV2 = forwardRef(
  ({ data = {}, variables = [], onSave = () => {} }, ref) => {
    const [fxContent, setFxContent] = useState(data.content || {});
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const properties = useMemo(() => {
      if (!variables || !Array.isArray(variables)) return [];
      
      return variables.map((v) => ({
        name: v.name || v.label || v.id,
        label: v.label || v.name || v.id,
        type: v.type || 'text',
        icon: v.icon,
      }));
    }, [variables]);

    const handleOpenEditor = useCallback(() => {
      setIsEditorOpen(true);
    }, []);

    const handleCloseEditor = useCallback(() => {
      setIsEditorOpen(false);
    }, []);

    const handleSaveFormula = useCallback((formula) => {
      setFxContent((prev) => ({
        ...prev,
        formula,
        lastUpdated: Date.now(),
      }));
      setIsEditorOpen(false);
    }, []);

    const hasErrors = useMemo(() => {
      return fxContent?.errors && fxContent.errors.length > 0;
    }, [fxContent?.errors]);

    const handleFormulaChange = useCallback((value, tokens, validation) => {
      setFxContent((prev) => ({
        ...prev,
        formula: value,
        tokens,
        result: validation?.result,
        errors: validation?.errors,
      }));
    }, []);

    const tabs = useMemo(() => {
      return [
        {
          label: "CONFIGURE",
          panelComponent: ConfigureTab,
          panelComponentProps: {
            variables,
            fxContent,
            setFxContent,
            onOpenEditor: handleOpenEditor,
          },
        },
      ];
    }, [fxContent, variables, handleOpenEditor]);

    useImperativeHandle(ref, () => ({
      getData: () => {
        return {
          content: fxContent,
          errors: fxContent?.errors || [],
        };
      },
    }));

    return (
      <>
        <TabContainer
          tabs={tabs || []}
          colorPalette={{
            dark: TRANSFORMER_V2_NODE.dark,
            light: TRANSFORMER_V2_NODE.light,
            foreground: TRANSFORMER_V2_NODE.foreground,
          }}
          onSave={onSave}
          validTabIndices={[0]}
          showCommonActionFooter={true}
          validateTabs={true}
        />

        <FormulaBarV2
          isOpen={isEditorOpen}
          onClose={handleCloseEditor}
          onSave={handleSaveFormula}
          onValueChange={handleFormulaChange}
          defaultValue={fxContent?.formula || ""}
          properties={properties}
          title="Transformer V2 - Formula Editor"
        />
      </>
    );
  }
);

export default TransformerV2;
