import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import FormulaBarV3 from './FormulaBarV3';
import DebugPanel from './DebugPanel';
import { debugFormula } from '../engine';
import { arithmeticData } from '../data/arithmetic-data';
import { textData } from '../data/text-data';
import { logicalData } from '../data/logical-data';
import { dateData } from '../data/date-data';
import { arrayData } from '../data/array-data';
import { otherData } from '../data/other-data';
import { FUNCTIONS } from '../constants/types';
import classes from './FormulaEditorWithDebug.module.css';

const buildFunctionRegistry = () => {
  const registry = {};
  
  const allData = [arithmeticData, textData, logicalData, dateData, arrayData, otherData];
  
  allData.forEach(data => {
    const functions = data[FUNCTIONS] || [];
    functions.forEach(func => {
      const name = func.displayValue || func.value;
      registry[name] = func;
      registry[name.toLowerCase()] = func;
    });
  });
  
  return registry;
};

const buildVariableRegistry = (variables) => {
  const registry = {};
  
  if (!variables) return registry;
  
  Object.entries(variables).forEach(([category, items]) => {
    if (Array.isArray(items)) {
      items.forEach(item => {
        const name = item.displayValue || item.name || item.value;
        registry[name] = {
          ...item,
          type: item.returnType || item.type || 'any',
          nullable: item.nullable ?? true,
        };
      });
    }
  });
  
  return registry;
};

const FormulaEditorWithDebug = ({
  defaultInputContent = [],
  variables,
  variableValues = {},
  onInputContentChanged = () => {},
  onDebugResult = () => {},
  debugMode: controlledDebugMode,
  onDebugModeChange,
  showDebugToggle = true,
  ...forwardedProps
}) => {
  const [internalDebugMode, setInternalDebugMode] = useState(false);
  const [currentContent, setCurrentContent] = useState(defaultInputContent);
  const [debugResult, setDebugResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const debugMode = controlledDebugMode !== undefined ? controlledDebugMode : internalDebugMode;
  
  const functionRegistry = useMemo(() => buildFunctionRegistry(), []);
  const variableRegistry = useMemo(() => buildVariableRegistry(variables), [variables]);

  const handleDebugModeToggle = useCallback(() => {
    const newValue = !debugMode;
    if (onDebugModeChange) {
      onDebugModeChange(newValue);
    } else {
      setInternalDebugMode(newValue);
    }
  }, [debugMode, onDebugModeChange]);

  const handleContentChange = useCallback((content, contentStr) => {
    setCurrentContent(content);
    onInputContentChanged(content, contentStr);
  }, [onInputContentChanged]);

  useEffect(() => {
    if (!debugMode || !currentContent || currentContent.length === 0) {
      setDebugResult(null);
      return;
    }

    setIsEvaluating(true);

    const timeoutId = setTimeout(() => {
      try {
        const result = debugFormula(currentContent, {
          functionRegistry,
          variableRegistry,
          variableValues,
        });
        
        setDebugResult(result);
        onDebugResult(result);
      } catch (error) {
        setDebugResult({
          success: false,
          value: null,
          errors: [error.message],
          diagnostics: [],
          trace: [],
        });
      } finally {
        setIsEvaluating(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [debugMode, currentContent, functionRegistry, variableRegistry, variableValues, onDebugResult]);

  return (
    <div className={classes.container}>
      <div className={classes.editorSection}>
        <FormulaBarV3
          defaultInputContent={defaultInputContent}
          variables={variables}
          onInputContentChanged={handleContentChange}
          {...forwardedProps}
        />
        
        {showDebugToggle && (
          <div className={classes.debugToggleRow}>
            <label className={classes.debugToggle}>
              <input
                type="checkbox"
                checked={debugMode}
                onChange={handleDebugModeToggle}
                className={classes.toggleInput}
              />
              <span className={classes.toggleSlider}></span>
              <span className={classes.toggleLabel}>Debug mode</span>
            </label>
            {debugResult?.ast?.inferredType && (
              <span className={classes.typeIndicator}>
                Type: {debugResult.ast.inferredType.kind}
                {debugResult.ast.nullable ? '?' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {debugMode && (
        <div className={classes.debugSection}>
          <DebugPanel
            debugResult={debugResult}
            isLoading={isEvaluating}
          />
        </div>
      )}
    </div>
  );
};

export default FormulaEditorWithDebug;
