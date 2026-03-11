import React from "react";
import classes from "./RightPanel.module.css";

const RightPanel = ({ selectedItem }) => {
  if (!selectedItem) {
    return (
      <div className={classes.container}>
        <div className={classes.emptyState}>
          Select an element from the left panel to see its documentation
        </div>
      </div>
    );
  }

  const displayName = selectedItem.displayValue || selectedItem.value || selectedItem.name;
  const description = selectedItem.description || "";
  const returnType = selectedItem.returnType || "any";
  const args = selectedItem.args || [];
  const isFunction = selectedItem.subCategory === "FUNCTIONS" || 
    selectedItem.section === "functions" || 
    selectedItem.originalSection === "functions";

  const renderSignature = () => {
    if (!isFunction) return null;
    
    const argStrings = args.map((arg, idx) => {
      const name = arg.name || `Value${idx + 1}`;
      return `${name}: ${arg.type || "any"}`;
    });
    
    return `${displayName} (${argStrings.join("; ")})`;
  };

  const sanitizeHtml = (html) => {
    if (!html || typeof html !== "string") return "";
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/javascript\s*:/gi, "")
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "");
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        {returnType && returnType !== "any" && (
          <span className={classes.typeBadge}>{returnType}</span>
        )}
        <span className={classes.itemName}>{displayName}</span>
      </div>

      {description && (
        <div
          className={classes.description}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
        />
      )}

      {isFunction && (
        <div className={classes.syntaxSection}>
          <div className={classes.sectionTitle}>Syntax</div>
          <code className={classes.syntaxCode}>{renderSignature()}</code>
        </div>
      )}

      {args.length > 0 && (
        <div className={classes.argsSection}>
          <div className={classes.sectionTitle}>Arguments</div>
          {args.map((arg, idx) => (
            <div key={idx} className={classes.argItem}>
              <div className={classes.argHeader}>
                <span className={classes.argName}>{arg.name || `arg${idx + 1}`}</span>
                <span className={classes.argType}>{arg.type || "any"}</span>
                {arg.required ? (
                  <span className={classes.requiredBadge}>required</span>
                ) : (
                  <span className={classes.optionalBadge}>optional</span>
                )}
              </div>
              {arg.description && (
                <div className={classes.argDescription}>{arg.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isFunction && (
        <div className={classes.variableInfo}>
          <div className={classes.infoRow}>
            <span className={classes.infoLabel}>Type</span>
            <span className={classes.infoValue}>
              {selectedItem.returnType || selectedItem.type || "any"}
            </span>
          </div>
          {selectedItem.variableData?.path && selectedItem.variableData.path.length > 0 && (
            <div className={classes.infoRow}>
              <span className={classes.infoLabel}>Path</span>
              <span className={classes.infoValue}>
                {selectedItem.variableData.path.join(".")}
              </span>
            </div>
          )}
        </div>
      )}

      {isFunction && (
        <div className={classes.examplesSection}>
          <div className={classes.sectionTitle}>Examples related to function</div>
          {selectedItem.examples && selectedItem.examples.length > 0 ? (
            selectedItem.examples.map((example, idx) => (
              <div key={idx} className={classes.exampleCard}>
                <span className={classes.exampleText}>{example}</span>
                <svg
                  className={classes.copyIcon}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  onClick={() => {
                    navigator.clipboard.writeText(example);
                  }}
                >
                  <path
                    d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            ))
          ) : (
            <div className={classes.exampleCard}>
              <span className={classes.exampleText}>
                {isFunction ? renderSignature() : displayName}
              </span>
              <svg
                className={classes.copyIcon}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                onClick={() => {
                  navigator.clipboard.writeText(
                    isFunction ? renderSignature() : displayName
                  );
                }}
              >
                <path
                  d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RightPanel;
