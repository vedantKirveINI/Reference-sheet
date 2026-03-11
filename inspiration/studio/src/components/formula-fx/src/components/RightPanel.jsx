import React, { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLucideIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import FormulaExampleCard from "./FormulaExampleCard.jsx";
import { getFriendlyTypeLabel } from "../utils/friendly-type-labels.js";
import classes from "./RightPanel.module.css";

const MODULE_LABELS = {
  Question: "Form Question",
  HTTP: "HTTP Request",
  Webhook: "Webhook",
  Database: "Database",
  Email: "Email",
  Slack: "Slack",
  GoogleSheets: "Google Sheets",
  Airtable: "Airtable",
  Stripe: "Stripe",
};

const getFriendlyModule = (module) => {
  if (!module) return null;
  return MODULE_LABELS[module] || module;
};

const getFriendlyNodeType = (nodeType) => {
  if (!nodeType) return null;
  const map = {
    trigger: "Trigger Step",
    action: "Action Step",
    condition: "Condition",
    loop: "Loop",
    webhook: "Webhook",
    form: "Form",
  };
  return map[nodeType] || nodeType;
};

const renderFriendlySample = (value) => {
  if (value === null || value === undefined) return null;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return (
      <div className={classes.sampleTable}>
        <div className={classes.sampleRow}>
          <span className={classes.sampleValue}>{String(value)}</span>
        </div>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className={classes.sampleTable}>
        <div className={classes.sampleRow}>
          <span className={classes.sampleKey} style={{ opacity: 0.6, fontSize: '10px' }}>
            Array ({value.length} items)
          </span>
        </div>
        {value.slice(0, 8).map((item, idx) => (
          <div key={idx} className={classes.sampleRow}>
            <span className={classes.sampleArrayIndex}>{idx + 1}</span>
            <span className={classes.sampleValue}>
              {typeof item === "object" && item !== null
                ? JSON.stringify(item).length > 50
                  ? JSON.stringify(item).substring(0, 47) + "..."
                  : JSON.stringify(item)
                : String(item)}
            </span>
          </div>
        ))}
        {value.length > 8 && (
          <div className={classes.sampleRow} style={{ justifyContent: 'center' }}>
            <span className={classes.sampleKey} style={{ opacity: 0.5, fontSize: '10px' }}>
              +{value.length - 8} more items
            </span>
          </div>
        )}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value).slice(0, 10);
    return (
      <div className={classes.sampleTable}>
        {entries.map(([key, val]) => (
          <div key={key} className={classes.sampleRow}>
            <span className={classes.sampleKey}>{key}</span>
            <span className={classes.sampleValue}>
              {val === null
                ? "null"
                : typeof val === "object"
                  ? JSON.stringify(val).length > 40
                    ? JSON.stringify(val).substring(0, 37) + "..."
                    : JSON.stringify(val)
                  : String(val)}
            </span>
          </div>
        ))}
        {Object.keys(value).length > 10 && (
          <div className={classes.sampleRow} style={{ justifyContent: 'center' }}>
            <span className={classes.sampleKey} style={{ opacity: 0.5, fontSize: '10px' }}>
              +{Object.keys(value).length - 10} more fields
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={classes.sampleTable}>
      <div className={classes.sampleRow}>
        <span className={classes.sampleValue}>{String(value)}</span>
      </div>
    </div>
  );
};

const RightPanel = ({ selectedItem, onInsertFormula }) => {
  if (!selectedItem) {
    const InfoIcon = getLucideIcon("OUTEInfoIcon", {
      size: 16,
      className: "text-muted-foreground opacity-40 mb-0.5",
    });
    return (
      <div className="w-[55%] p-2 overflow-y-auto bg-muted rounded-lg rounded-l-none h-full flex flex-col">
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-sm leading-normal py-6 gap-1.5">
          {InfoIcon}

          <span className={classes.emptyTitle}>Documentation</span>
          <span className={classes.emptyHint}>
            Hover over an item to see details
          </span>
        </div>
      </div>
    );
  }

  const displayName =
    selectedItem.displayValue || selectedItem.value || selectedItem.name;
  const description = selectedItem.description || "";
  const returnType = selectedItem.returnType || "any";
  const args = selectedItem.args || [];
  const isFunction =
    selectedItem.subCategory === "FUNCTIONS" ||
    selectedItem.section === "functions" ||
    selectedItem.originalSection === "functions";

  const isVariable =
    selectedItem.subCategory === "NODE_VARIABLES" ||
    selectedItem.type === "NODE_VARIABLES" ||
    !!selectedItem.variableData;

  const renderSignature = () => {
    if (!isFunction) return null;
    const argStrings = args.map((arg, idx) => {
      const name = arg.name || `Value${idx + 1}`;
      return `${name}: ${arg.type || "any"}`;
    });
    return `${displayName} (${argStrings.join(", ")})`;
  };

  const sanitizeHtml = (html) => {
    if (!html || typeof html !== "string") return "";
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/javascript\s*:/gi, "")
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "");
  };

  const handleInsertExample = (formula) => {
    if (onInsertFormula) {
      onInsertFormula(formula);
    }
  };

  const handleUseFunction = () => {
    if (onInsertFormula) {
      const fnName = selectedItem.value || selectedItem.name || displayName;
      const template = `${fnName}()`;
      onInsertFormula(template);
    }
  };

  const renderVariableView = () => {
    const vd = selectedItem.variableData || {};
    const nodeName = vd.nodeName || displayName;
    const module = getFriendlyModule(vd.module);
    const nodeType = getFriendlyNodeType(vd.nodeType);
    const path = vd.path || [];
    const sampleValue = vd.sample_value ?? vd.default;
    const schema = vd.schema || [];
    const fieldType = vd.type || selectedItem.returnType || "any";

    const nodeNumber = selectedItem.nodeNumber || vd.nodeNumber;
    const bg = selectedItem.background;

    return (
      <div className={classes.referenceContent}>
        <div className={classes.sourceSection}>
          <div className={classes.sectionTitle}>Source Step</div>
          <div className={classes.sourceCard}>
            {bg && (
              <span className={classes.sourceDot} style={{ background: bg }} />
            )}
            <span className={classes.sourceName}>
              {nodeNumber ? `${nodeNumber}. ` : ""}
              {nodeName}
            </span>
            {module && <span className={classes.sourceModule}>{module}</span>}
          </div>
        </div>

        {nodeType && (
          <div className={classes.infoRow}>
            <span className={classes.infoLabel}>Step Type</span>
            <span className={classes.infoValue}>{nodeType}</span>
          </div>
        )}

        <div className={classes.infoRow}>
          <span className={classes.infoLabel}>Data Type</span>
          <span className={classes.infoValue}>
            {getFriendlyTypeLabel(fieldType)}
          </span>
        </div>

        {path.length > 0 && (
          <div className={classes.infoRow}>
            <span className={classes.infoLabel}>Field Path</span>
            <span className={classes.pathValue}>{path.join(" → ")}</span>
          </div>
        )}

        {sampleValue !== undefined &&
          sampleValue !== null &&
          sampleValue !== "" && (
            <div className={classes.sampleSection}>
              <div className={classes.sectionTitle}>Sample Output</div>
              {renderFriendlySample(sampleValue)}
            </div>
          )}

        {schema.length > 0 && (
          <div className={classes.fieldsSection}>
            <div className={classes.sectionTitle}>
              Fields Inside ({schema.length})
            </div>
            <div className={classes.fieldsList}>
              {schema.slice(0, 12).map((child, idx) => (
                <div key={idx} className={classes.fieldItem}>
                  <span className={classes.fieldName}>
                    {child.label || child.key || child.name}
                  </span>
                  <span className={classes.fieldType}>
                    {getFriendlyTypeLabel(child.type) || "Any"}
                  </span>
                </div>
              ))}
              {schema.length > 12 && (
                <div className={classes.fieldMore}>
                  +{schema.length - 12} more fields
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFunctionView = () => {
    return (
      <div className={classes.referenceContent}>
        {description && (
          <div
            className="text-sm leading-normal text-muted-foreground [&_p]:m-0 [&_p]:mb-1"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(description),
            }}
          />
        )}

        <div className={classes.syntaxSection}>
          <div className={classes.sectionTitle}>Syntax</div>
          <code className={classes.syntaxCode}>{renderSignature()}</code>
        </div>

        {args.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Arguments
            </div>
            {args.map((arg, idx) => (
              <div
                key={idx}
                className={cn(
                  "py-1.5 px-2 bg-background rounded-md mb-1",
                  arg.required
                    ? "border border-border border-l-2 border-l-muted-foreground/50 bg-muted/30"
                    : "border border-dashed border-border/70"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "w-[6px] h-[6px] rounded-full shrink-0",
                      arg.required ? "bg-emerald-500" : "bg-gray-300"
                    )}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {arg.required
                      ? (arg.name || `arg${idx + 1}`)
                      : `[${arg.name || `arg${idx + 1}`}]`}
                  </span>
                  <span className="inline-flex items-center justify-center text-[10px] text-muted-foreground py-0.5 px-1.5 bg-muted rounded-full leading-tight">
                    {getFriendlyTypeLabel(arg.type) || "Any"}
                  </span>
                </div>
                {arg.description && (
                  <div className="mt-0.5 text-xs text-muted-foreground leading-tight ml-[18px]">
                    {arg.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={classes.examplesSection}>
          <div className={classes.sectionTitle}>Examples</div>
          {selectedItem.examples && selectedItem.examples.length > 0 ? (
            selectedItem.examples.map((example, idx) => {
              if (typeof example === "object" && example.formula) {
                return (
                  <FormulaExampleCard
                    key={idx}
                    formula={example.formula}
                    result={example.result}
                    onInsert={onInsertFormula ? handleInsertExample : undefined}
                  />
                );
              } else {
                return (
                  <div key={idx} className={classes.exampleCard}>
                    <span
                      className={cn(
                        classes.exampleText,
                        onInsertFormula && "cursor-pointer hover:text-primary transition-colors duration-150"
                      )}
                      onClick={onInsertFormula ? () => handleInsertExample(example) : undefined}
                    >
                      {example}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(classes.copyButton, "flex-shrink-0")}
                      onClick={() => {
                        navigator.clipboard.writeText(example);
                      }}
                    >
                      {getLucideIcon("OUTECopyContentIcon", {
                        size: 12,
                      })}
                    </Button>
                  </div>
                );
              }
            })
          ) : (
            <div className={classes.exampleCard}>
              <span className={classes.exampleText}>{renderSignature()}</span>
              <Button
                variant="ghost"
                size="icon"
                className={cn(classes.copyButton, "flex-shrink-0")}
                onClick={() => {
                  navigator.clipboard.writeText(renderSignature());
                }}
              >
                {getLucideIcon("OUTECopyContentIcon", { size: 12 })}
              </Button>
            </div>
          )}
        </div>

        {onInsertFormula && (
          <Button
            className="w-full mt-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
            size="sm"
            onClick={handleUseFunction}
          >
            Use Function
            {getLucideIcon("ArrowRight", { size: 14, className: "ml-1.5" })}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <span className={classes.itemName}>
          {isVariable
            ? selectedItem.variableData?.label ||
              displayName?.split(".").pop() ||
              displayName
            : displayName}
        </span>
        {returnType && returnType !== "any" && (
          <Badge variant="secondary" className={cn(classes.typeBadge)}>
            {getFriendlyTypeLabel(returnType)}
          </Badge>
        )}
      </div>

      {isVariable ? (
        renderVariableView()
      ) : isFunction ? (
        renderFunctionView()
      ) : (
        <div className={classes.referenceContent}>
          {description && (
            <div
              className={classes.description}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(description),
              }}
            />
          )}
          <div className={classes.variableInfo}>
            <div className={classes.infoRow}>
              <span className={classes.infoLabel}>Type</span>
              <span className={classes.infoValue}>
                {getFriendlyTypeLabel(
                  selectedItem.returnType || selectedItem.type,
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(RightPanel);
