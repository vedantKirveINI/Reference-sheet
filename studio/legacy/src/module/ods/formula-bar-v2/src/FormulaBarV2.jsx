import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useEffect, useMemo } from "react";
import classes from './FormulaBarV2.module.css';
import FormulaEditor from './components/editor/FormulaEditor.jsx';
import ElementsPanel from './components/panels/ElementsPanel.jsx';
import HelpPanel from './components/panels/HelpPanel.jsx';
import PreviewSection from './components/preview/PreviewSection.jsx';
import { parseFormula, validateFormula } from './utils/parser.js';
import { blocks } from '../../formula-bar/src/data/data.jsx';
import cloneDeep from "lodash/cloneDeep";

export const FormulaBarV2 = forwardRef(({
  defaultValue = "",
  properties = [],
  variables = {},
  onValueChange = () => {},
  onSave = () => {},
  onDiscard = () => {},
  onClose = () => {},
  isOpen = true,
  title = "Edit formula",
  showAIPrompt = false,
  aiPromptPlaceholder = "Ask AI to write or edit your formula...",
  previewData = null,
  debugMode = false,
}, ref) => {
  const editorRef = useRef();
  const [formula, setFormula] = useState(defaultValue);
  const [parsedTokens, setParsedTokens] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [previewResult, setPreviewResult] = useState({ value: null, type: 'unknown' });
  const [errors, setErrors] = useState([]);
  const [isDebugMode, setIsDebugMode] = useState(debugMode);
  const [aiPrompt, setAIPrompt] = useState("");
  const [isAIThinking, setIsAIThinking] = useState(false);

  const generateExamples = useCallback((fn) => {
    const examples = [];
    if (fn.args && fn.args.length > 0) {
      const argList = fn.args.map(arg => {
        if (arg.type === 'number') return '1';
        if (arg.type === 'string') return '"text"';
        if (arg.type === 'boolean') return 'true';
        if (arg.type === 'array') return '[1, 2, 3]';
        return 'value';
      }).join(', ');
      examples.push(`${fn.value}(${argList})`);
    } else {
      examples.push(`${fn.value}()`);
    }
    return examples;
  }, []);

  const allElements = useMemo(() => {
    const elements = {
      properties: properties.map(p => ({
        ...p,
        category: 'Properties',
        subCategory: p.type?.toUpperCase() || 'TEXT'
      })),
      builtIns: [
        { value: '+', label: '+', category: 'Built-ins', subCategory: 'OPERATORS', description: 'Addition operator', returnType: 'number', examples: ['2 + 3 = 5', '"hello" + "world" = "helloworld"'] },
        { value: '-', label: '-', category: 'Built-ins', subCategory: 'OPERATORS', description: 'Subtraction operator', returnType: 'number', examples: ['5 - 2 = 3'] },
        { value: '*', label: '*', category: 'Built-ins', subCategory: 'OPERATORS', description: 'Multiplication operator', returnType: 'number', examples: ['3 * 4 = 12'] },
        { value: '/', label: '/', category: 'Built-ins', subCategory: 'OPERATORS', description: 'Division operator', returnType: 'number', examples: ['10 / 2 = 5'] },
        { value: '%', label: '%', category: 'Built-ins', subCategory: 'OPERATORS', description: 'Modulo operator', returnType: 'number', examples: ['7 % 3 = 1'] },
        { value: '^', label: '^', category: 'Built-ins', subCategory: 'OPERATORS', description: 'Power operator', returnType: 'number', examples: ['2 ^ 3 = 8'] },
        { value: '==', label: '==', category: 'Built-ins', subCategory: 'COMPARISON', description: 'Equality comparison', returnType: 'boolean', examples: ['1 == 1 = true', '"a" == "b" = false'] },
        { value: '!=', label: '!=', category: 'Built-ins', subCategory: 'COMPARISON', description: 'Inequality comparison', returnType: 'boolean', examples: ['1 != 2 = true'] },
        { value: '>', label: '>', category: 'Built-ins', subCategory: 'COMPARISON', description: 'Greater than', returnType: 'boolean', examples: ['3 > 2 = true'] },
        { value: '<', label: '<', category: 'Built-ins', subCategory: 'COMPARISON', description: 'Less than', returnType: 'boolean', examples: ['2 < 3 = true'] },
        { value: '>=', label: '>=', category: 'Built-ins', subCategory: 'COMPARISON', description: 'Greater than or equal', returnType: 'boolean', examples: ['3 >= 3 = true'] },
        { value: '<=', label: '<=', category: 'Built-ins', subCategory: 'COMPARISON', description: 'Less than or equal', returnType: 'boolean', examples: ['2 <= 3 = true'] },
        { value: 'and', label: 'and', category: 'Built-ins', subCategory: 'LOGICAL', description: 'Logical AND', returnType: 'boolean', examples: ['true and false = false', 'true && true = true'] },
        { value: 'or', label: 'or', category: 'Built-ins', subCategory: 'LOGICAL', description: 'Logical OR', returnType: 'boolean', examples: ['true or false = true', 'false || false = false'] },
        { value: 'not', label: 'not', category: 'Built-ins', subCategory: 'LOGICAL', description: 'Logical NOT', returnType: 'boolean', examples: ['not true = false', '!false = true'] },
        { value: 'true', label: 'true', category: 'Built-ins', subCategory: 'BOOLEAN', description: 'Boolean true value', returnType: 'boolean', examples: ['true'] },
        { value: 'false', label: 'false', category: 'Built-ins', subCategory: 'BOOLEAN', description: 'Boolean false value', returnType: 'boolean', examples: ['false'] },
        { value: '? :', label: '? :', category: 'Built-ins', subCategory: 'TERNARY', description: 'Ternary operator (if-else shorthand)', returnType: 'any', examples: ['condition ? valueIfTrue : valueIfFalse', 'true ? "yes" : "no" = "yes"'] },
      ],
      functions: []
    };

    blocks.forEach(block => {
      if (block.functions) {
        block.functions.forEach(fn => {
          elements.functions.push({
            ...fn,
            label: fn.value,
            category: block.label,
            examples: fn.example ? [fn.example] : generateExamples(fn)
          });
        });
      }
    });

    return elements;
  }, [properties, generateExamples]);

  const handleFormulaChange = useCallback((value, tokens) => {
    setFormula(value);
    setParsedTokens(tokens);
    
    const validation = validateFormula(value, allElements, previewData || {});
    setErrors(validation.errors);
    setPreviewResult(validation.result || { value: null, type: 'unknown' });
    
    onValueChange(value, tokens, validation);
  }, [allElements, previewData, onValueChange]);

  const handleElementClick = useCallback((element) => {
    setSelectedElement(element);
  }, []);

  const handleElementInsert = useCallback((element) => {
    if (editorRef.current) {
      editorRef.current.insertElement(element);
    }
  }, []);

  const handleSave = useCallback(() => {
    if (errors.length === 0) {
      onSave(formula, parsedTokens);
      onClose();
    }
  }, [formula, parsedTokens, errors, onSave, onClose]);

  const handleDiscard = useCallback(() => {
    onDiscard();
    onClose();
  }, [onDiscard, onClose]);

  const handleCopyExample = useCallback((example) => {
    if (editorRef.current) {
      editorRef.current.insertText(example);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    getValue: () => formula,
    getTokens: () => parsedTokens,
    setValue: (value) => setFormula(value),
    focus: () => editorRef.current?.focus(),
    insertElement: (element) => editorRef.current?.insertElement(element),
  }), [formula, parsedTokens]);

  useEffect(() => {
    if (defaultValue) {
      setFormula(defaultValue);
      const validation = validateFormula(defaultValue, allElements, previewData || {});
      setErrors(validation.errors);
      setPreviewResult(validation.result || { value: null, type: 'unknown' });
    }
  }, [defaultValue, allElements, previewData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isAIThinking) {
          setIsAIThinking(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isAIThinking, onClose]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className={classes.overlay} onClick={handleOverlayClick}>
      <div className={classes.modal} onClick={(e) => e.stopPropagation()}>
        <header className={classes.header}>
          <div className={classes.headerLeft}>
            <span className={classes.title}>{title}</span>
            <button className={classes.helpButton} title="Help">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <text x="8" y="12" textAnchor="middle" fontSize="10" fill="currentColor">?</text>
              </svg>
            </button>
          </div>
          <div className={classes.headerRight}>
            <button className={classes.discardButton} onClick={handleDiscard}>
              Discard all changes
            </button>
            <button className={classes.closeButton} onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </header>

        {showAIPrompt && (
          <div className={classes.aiPromptSection}>
            <div className={classes.aiPromptIcon}>
              {isAIThinking ? (
                <span className={classes.thinkingDots}>
                  <span className={classes.aiIcon}>✨</span>
                  Thinking
                  <span className={classes.dots}>
                    <span>.</span><span>.</span><span>.</span>
                  </span>
                </span>
              ) : (
                <span className={classes.aiIcon}>✨</span>
              )}
            </div>
            <input
              type="text"
              className={classes.aiPromptInput}
              placeholder={aiPromptPlaceholder}
              value={aiPrompt}
              onChange={(e) => setAIPrompt(e.target.value)}
              disabled={isAIThinking}
            />
            {isAIThinking && (
              <button className={classes.cancelButton} onClick={() => setIsAIThinking(false)}>
                Cancel <span className={classes.escHint}>ESC</span>
              </button>
            )}
            <div className={classes.aiActions}>
              <button className={classes.undoButton} title="Undo">↩</button>
              <button className={classes.thumbsUp} title="Good response">👍</button>
              <button className={classes.thumbsDown} title="Bad response">👎</button>
              <button className={classes.submitButton} title="Submit">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="#4285f4"/>
                  <path d="M8 4V12M8 4L5 7M8 4L11 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 8 8)"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className={classes.editorSection}>
          <FormulaEditor
            ref={editorRef}
            value={formula}
            onChange={handleFormulaChange}
            properties={properties}
            errors={errors}
            placeholder="Your formula"
          />
          <button 
            className={classes.newButton}
            onClick={handleSave}
            disabled={errors.length > 0}
          >
            New <span className={classes.dropdownArrow}>▼</span>
          </button>
        </div>

        <PreviewSection
          result={previewResult}
          errors={errors}
          previewData={previewData}
          debugMode={isDebugMode}
          onDebugModeToggle={() => setIsDebugMode(!isDebugMode)}
        />

        <div className={classes.panelsContainer}>
          <ElementsPanel
            elements={allElements}
            onElementClick={handleElementClick}
            onElementInsert={handleElementInsert}
            selectedElement={selectedElement}
          />
          <HelpPanel
            selectedElement={selectedElement}
            onCopyExample={handleCopyExample}
          />
        </div>
      </div>
    </div>
  );
});

export default FormulaBarV2;
