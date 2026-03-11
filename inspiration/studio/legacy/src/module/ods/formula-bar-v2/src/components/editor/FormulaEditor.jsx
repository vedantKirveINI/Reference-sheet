import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useEffect } from "react";
import classes from './FormulaEditor.module.css';
import PropertyToken from '../tokens/PropertyToken.jsx';

const TOKEN_PATTERNS = {
  COMMENT: /\/\*[\s\S]*?\*\//g,
  STRING: /"[^"]*"|'[^']*'/g,
  NUMBER: /\b\d+\.?\d*\b/g,
  FUNCTION: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
  PROPERTY: /\bprop\s*\(\s*["']([^"']+)["']\s*\)/g,
  OPERATOR: /[+\-*/%^=!<>&|?:]+/g,
  KEYWORD: /\b(true|false|and|or|not|if|else|let|lets|current|index)\b/g,
};

const FormulaEditor = forwardRef(({
  value = "",
  onChange = () => {},
  properties = [],
  errors = [],
  placeholder = "Your formula",
  readOnly = false,
}, ref) => {
  const textareaRef = useRef();
  const highlightRef = useRef();
  const [localValue, setLocalValue] = useState(value);
  const [cursorPosition, setCursorPosition] = useState(0);

  const tokenize = useCallback((text) => {
    const tokens = [];
    let remaining = text;
    let position = 0;

    while (remaining.length > 0) {
      let matched = false;

      const commentMatch = remaining.match(/^\/\*[\s\S]*?\*\//);
      if (commentMatch) {
        tokens.push({ type: 'comment', value: commentMatch[0], start: position, end: position + commentMatch[0].length });
        position += commentMatch[0].length;
        remaining = remaining.slice(commentMatch[0].length);
        matched = true;
        continue;
      }

      const stringMatch = remaining.match(/^("[^"]*"|'[^']*')/);
      if (stringMatch) {
        tokens.push({ type: 'string', value: stringMatch[0], start: position, end: position + stringMatch[0].length });
        position += stringMatch[0].length;
        remaining = remaining.slice(stringMatch[0].length);
        matched = true;
        continue;
      }

      const propMatch = remaining.match(/^prop\s*\(\s*["']([^"']+)["']\s*\)/);
      if (propMatch) {
        const propName = propMatch[1];
        const property = properties.find(p => p.name === propName || p.label === propName);
        tokens.push({ 
          type: 'property', 
          value: propMatch[0], 
          propertyName: propName,
          propertyType: property?.type || 'text',
          start: position, 
          end: position + propMatch[0].length 
        });
        position += propMatch[0].length;
        remaining = remaining.slice(propMatch[0].length);
        matched = true;
        continue;
      }

      const numberMatch = remaining.match(/^\d+\.?\d*/);
      if (numberMatch) {
        tokens.push({ type: 'number', value: numberMatch[0], start: position, end: position + numberMatch[0].length });
        position += numberMatch[0].length;
        remaining = remaining.slice(numberMatch[0].length);
        matched = true;
        continue;
      }

      const keywordMatch = remaining.match(/^(true|false|and|or|not|if|else|let|lets|current|index)\b/);
      if (keywordMatch) {
        tokens.push({ type: 'keyword', value: keywordMatch[0], start: position, end: position + keywordMatch[0].length });
        position += keywordMatch[0].length;
        remaining = remaining.slice(keywordMatch[0].length);
        matched = true;
        continue;
      }

      const funcMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/);
      if (funcMatch) {
        tokens.push({ type: 'function', value: funcMatch[1], start: position, end: position + funcMatch[1].length });
        position += funcMatch[1].length;
        remaining = remaining.slice(funcMatch[1].length);
        matched = true;
        continue;
      }

      const operatorMatch = remaining.match(/^[+\-*/%^=!<>&|?:]+/);
      if (operatorMatch) {
        tokens.push({ type: 'operator', value: operatorMatch[0], start: position, end: position + operatorMatch[0].length });
        position += operatorMatch[0].length;
        remaining = remaining.slice(operatorMatch[0].length);
        matched = true;
        continue;
      }

      const identifierMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if (identifierMatch) {
        tokens.push({ type: 'identifier', value: identifierMatch[0], start: position, end: position + identifierMatch[0].length });
        position += identifierMatch[0].length;
        remaining = remaining.slice(identifierMatch[0].length);
        matched = true;
        continue;
      }

      const whitespaceMatch = remaining.match(/^\s+/);
      if (whitespaceMatch) {
        tokens.push({ type: 'whitespace', value: whitespaceMatch[0], start: position, end: position + whitespaceMatch[0].length });
        position += whitespaceMatch[0].length;
        remaining = remaining.slice(whitespaceMatch[0].length);
        matched = true;
        continue;
      }

      tokens.push({ type: 'other', value: remaining[0], start: position, end: position + 1 });
      position += 1;
      remaining = remaining.slice(1);
    }

    return tokens;
  }, [properties]);

  const renderHighlightedCode = useCallback(() => {
    const tokens = tokenize(localValue);
    
    return tokens.map((token, index) => {
      const hasError = errors.some(e => 
        e.position && 
        token.start >= e.position[0] && 
        token.end <= e.position[1]
      );

      if (token.type === 'property') {
        return (
          <PropertyToken
            key={index}
            name={token.propertyName}
            type={token.propertyType}
            hasError={hasError}
          />
        );
      }

      const className = `${classes[token.type] || ''} ${hasError ? classes.error : ''}`;
      
      if (token.type === 'whitespace') {
        return <span key={index}>{token.value}</span>;
      }

      return (
        <span key={index} className={className}>
          {token.value}
        </span>
      );
    });
  }, [localValue, errors, tokenize]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setCursorPosition(e.target.selectionStart);
    
    const tokens = tokenize(newValue);
    onChange(newValue, tokens);
  }, [onChange, tokenize]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = localValue.substring(0, start) + '  ' + localValue.substring(end);
      setLocalValue(newValue);
      
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
      
      onChange(newValue, tokenize(newValue));
    }
    
    if (e.key === 'Enter' && e.shiftKey) {
      return;
    }
  }, [localValue, onChange, tokenize]);

  const handleScroll = useCallback((e) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop;
      highlightRef.current.scrollLeft = e.target.scrollLeft;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    getValue: () => localValue,
    setValue: (val) => setLocalValue(val),
    insertElement: (element) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      let insertText = '';
      
      if (element.category === 'Properties') {
        insertText = `prop("${element.name || element.label}")`;
      } else if (element.subCategory === 'OPERATORS' || element.subCategory === 'COMPARISON' || element.subCategory === 'LOGICAL') {
        insertText = ` ${element.value} `;
      } else if (element.subCategory === 'BOOLEAN') {
        insertText = element.value;
      } else if (element.args && element.args.length > 0) {
        insertText = `${element.value}()`;
      } else if (element.value) {
        insertText = element.value;
      }
      
      const newValue = localValue.substring(0, start) + insertText + localValue.substring(end);
      setLocalValue(newValue);
      onChange(newValue, tokenize(newValue));
      
      setTimeout(() => {
        const newPos = start + insertText.length;
        if (insertText.endsWith('()')) {
          textarea.selectionStart = textarea.selectionEnd = newPos - 1;
        } else {
          textarea.selectionStart = textarea.selectionEnd = newPos;
        }
        textarea.focus();
      }, 0);
    },
    insertText: (text) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = localValue.substring(0, start) + text + localValue.substring(end);
      setLocalValue(newValue);
      onChange(newValue, tokenize(newValue));
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
      }, 0);
    },
  }), [localValue, onChange, tokenize]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const hasErrors = errors.length > 0;

  return (
    <div className={`${classes.container} ${hasErrors ? classes.hasError : ''}`}>
      <div className={classes.editorWrapper}>
        <div 
          ref={highlightRef}
          className={classes.highlightOverlay}
          aria-hidden="true"
        >
          {localValue ? renderHighlightedCode() : (
            <span className={classes.placeholder}>{placeholder}</span>
          )}
        </div>
        <textarea
          ref={textareaRef}
          className={classes.textarea}
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          placeholder=""
          readOnly={readOnly}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  );
});

export default FormulaEditor;
