import React, { useCallback, useState } from "react";
import classes from './HelpPanel.module.css';
import PropertyToken from '../tokens/PropertyToken.jsx';

const HelpPanel = ({
  selectedElement = null,
  onCopyExample = () => {},
}) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = useCallback((example, index) => {
    onCopyExample(example);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }, [onCopyExample]);

  const renderDescription = () => {
    if (!selectedElement) return null;

    const { description } = selectedElement;
    if (!description) return null;

    return <p className={classes.description}>{description}</p>;
  };

  const renderSignature = () => {
    if (!selectedElement) return null;

    const { value, args, returnType, subCategory, category } = selectedElement;

    if (category === 'Properties') {
      return (
        <div className={classes.signature}>
          <PropertyToken 
            name={selectedElement.name || selectedElement.label} 
            type={selectedElement.type || 'text'} 
          />
        </div>
      );
    }

    if (subCategory === 'OPERATORS' || subCategory === 'COMPARISON' || subCategory === 'LOGICAL' || subCategory === 'BOOLEAN' || subCategory === 'TERNARY') {
      return (
        <div className={classes.signature}>
          <code className={classes.operator}>{value}</code>
        </div>
      );
    }

    if (args && args.length > 0) {
      const argList = args.map((arg, i) => (
        <span key={i} className={classes.arg}>
          <span className={arg.required ? classes.required : classes.optional}>
            {arg.name}
          </span>
          <span className={classes.argType}>: {arg.type}</span>
          {i < args.length - 1 && <span className={classes.comma}>, </span>}
        </span>
      ));

      return (
        <div className={classes.signature}>
          <code>
            <span className={classes.funcName}>{value}</span>
            <span className={classes.paren}>(</span>
            {argList}
            <span className={classes.paren}>)</span>
            {returnType && (
              <>
                <span className={classes.arrow}> → </span>
                <span className={classes.returnType}>{returnType}</span>
              </>
            )}
          </code>
        </div>
      );
    }

    return (
      <div className={classes.signature}>
        <code>
          <span className={classes.funcName}>{value}</span>
          <span className={classes.paren}>()</span>
          {returnType && (
            <>
              <span className={classes.arrow}> → </span>
              <span className={classes.returnType}>{returnType}</span>
            </>
          )}
        </code>
      </div>
    );
  };

  const renderExamples = () => {
    if (!selectedElement) return null;

    const { examples = [] } = selectedElement;
    if (examples.length === 0) return null;

    return (
      <div className={classes.examples}>
        <h4 className={classes.examplesTitle}>Examples</h4>
        {examples.map((example, index) => (
          <div key={index} className={classes.exampleItem}>
            <code className={classes.exampleCode}>{example}</code>
            <button
              className={classes.copyButton}
              onClick={() => handleCopy(example, index)}
              title="Copy to editor"
            >
              {copiedIndex === index ? '✓' : '📋'}
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderPropertyInfo = () => {
    if (!selectedElement || selectedElement.category !== 'Properties') return null;

    return (
      <div className={classes.propertyInfo}>
        <div className={classes.infoRow}>
          <span className={classes.infoLabel}>Type:</span>
          <span className={classes.infoValue}>{selectedElement.type || 'Text'} property</span>
        </div>
      </div>
    );
  };

  if (!selectedElement) {
    return (
      <div className={classes.panel}>
        <div className={classes.placeholder}>
          <div className={classes.placeholderIcon}>📖</div>
          <p className={classes.placeholderText}>
            Select an element from the left panel to see its documentation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.panel}>
      <div className={classes.content}>
        <header className={classes.header}>
          <h3 className={classes.title}>
            {selectedElement.label || selectedElement.value || selectedElement.name}
          </h3>
          {selectedElement.category && (
            <span className={classes.category}>{selectedElement.category}</span>
          )}
        </header>

        {renderSignature()}
        {renderDescription()}
        {renderPropertyInfo()}
        {renderExamples()}
      </div>
    </div>
  );
};

export default HelpPanel;
