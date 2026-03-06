import React, { useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { GitBranch, Info } from "lucide-react";
import { IfElseComposer } from "./condition-composer";
import { THEME } from "../constants";

const ConfigureTab = forwardRef(({ state, variables, jumpToNodeOptions = [], onAddNode, onLinksChange }, ref) => {
  const composerRef = useRef();
  const { 
    composerData, 
    updateComposerData, 
    validation,
    setValidation,
  } = state;

  const handleComposerChange = useCallback((data) => {
    updateComposerData(data);
    if (onLinksChange) {
      onLinksChange(data);
    }
  }, [updateComposerData, onLinksChange]);

  const handleValidationChange = useCallback((validationResult) => {
    setValidation(validationResult);
  }, [setValidation]);

  const updateBlockMoveTo = useCallback((blockId, nodeInfo) => {
    if (composerRef.current?.updateBlockMoveTo) {
      composerRef.current.updateBlockMoveTo(blockId, nodeInfo);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    updateBlockMoveTo,
  }), [updateBlockMoveTo]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: THEME.iconBg }}
        >
          <GitBranch className="w-4 h-4" style={{ color: THEME.iconColor }} />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 text-sm">Conditional Branching</h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Create conditions to route your workflow. Each block can have multiple conditions connected with AND/OR logic.
          </p>
        </div>
      </div>

      <IfElseComposer
        ref={composerRef}
        initialData={composerData}
        variables={variables}
        jumpToNodeOptions={jumpToNodeOptions}
        onChange={handleComposerChange}
        onValidationChange={handleValidationChange}
        onAddNode={onAddNode}
      />

      {!validation.isValid && validation.errors.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            {validation.errors.map((error, index) => (
              <p key={index} className="text-sm text-amber-700">{error}</p>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 flex items-start gap-2 pt-2">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <span>
          Select fields from workflow variables on the left, choose an operator, and set a value on the right. 
          Values can be static text or dynamic variables.
        </span>
      </div>
    </div>
  );
});

ConfigureTab.displayName = "ConfigureTab";

export default ConfigureTab;
