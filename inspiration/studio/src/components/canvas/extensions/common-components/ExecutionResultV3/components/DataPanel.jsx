import { useMemo, useState } from "react";
import { ChevronRight, Copy, Check, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import styles from "./DataPanel.module.css";

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  } catch (err) {
  }
}

function DataField({ label, value, depth = 0, accentColor }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [copied, setCopied] = useState(false);

  const isPrimitive = value === null || value === undefined || 
    typeof value === "string" || typeof value === "number" || typeof value === "boolean";

  const handleCopy = (e) => {
    e.stopPropagation();
    copyToClipboard(typeof value === "object" ? JSON.stringify(value, null, 2) : String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isPrimitive) {
    return (
      <div className={styles.field} style={{ paddingLeft: `${depth * 1}rem` }}>
        <div className={styles.fieldHeader}>
          <span className={styles.fieldLabel}>{label}</span>
          <span 
            className={styles.copyBtn} 
            onClick={handleCopy} 
            role="button"
            tabIndex={0}
            title="Copy value"
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCopy(e); } }}
          >
            {copied ? <Check className={styles.copyIcon} /> : <Copy className={styles.copyIcon} />}
          </span>
        </div>
        <div className={styles.fieldValue} data-type={typeof value}>
          {value === null ? "null" : value === undefined ? "undefined" : String(value)}
        </div>
      </div>
    );
  }

  const entries = Array.isArray(value) 
    ? value.map((item, i) => [`[${i}]`, item])
    : Object.entries(value || {});

  const itemCount = entries.length;
  const typeLabel = Array.isArray(value) ? `${itemCount} items` : `${itemCount} fields`;

  return (
    <div className={styles.fieldGroup} style={{ paddingLeft: depth > 0 ? `${depth * 1}rem` : 0 }}>
      <div 
        className={styles.fieldGroupHeader}
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsExpanded(!isExpanded); } }}
      >
        <ChevronRight 
          className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ""}`}
          style={{ color: accentColor }}
        />
        <span className={styles.fieldLabel}>{label}</span>
        <span className={styles.fieldMeta}>{typeLabel}</span>
        <span 
          className={styles.copyBtn} 
          onClick={handleCopy} 
          role="button"
          tabIndex={0}
          title="Copy value"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCopy(e); } }}
        >
          {copied ? <Check className={styles.copyIcon} /> : <Copy className={styles.copyIcon} />}
        </span>
      </div>

      {isExpanded && (
        <div className={styles.fieldGroupContent}>
          {entries.map(([key, val]) => (
            <DataField 
              key={key} 
              label={key} 
              value={val} 
              depth={depth + 1}
              accentColor={accentColor}
            />
          ))}
          {entries.length === 0 && (
            <span className={styles.emptyState}>Empty</span>
          )}
        </div>
      )}
    </div>
  );
}

function DataPanel({ title, data, accentColor, variant = "input", hasError = false }) {
  const [copied, setCopied] = useState(false);
  const entries = useMemo(() => Object.entries(data || {}), [data]);

  const handleCopyAll = () => {
    copyToClipboard(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isEmpty = entries.length === 0;
  const Icon = variant === "input" ? ArrowDownToLine : ArrowUpFromLine;

  return (
    <div className={styles.panel} data-variant={variant} data-error={hasError}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>
          <Icon 
            className={styles.panelIcon} 
            style={{ color: hasError ? "#dc2626" : accentColor }}
          />
          <span>{title}</span>
        </div>
        <span 
          className={styles.copyAllBtn} 
          onClick={handleCopyAll}
          role="button"
          tabIndex={0}
          title="Copy all"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCopyAll(); } }}
        >
          {copied ? <Check className={styles.copyIcon} /> : <Copy className={styles.copyIcon} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </span>
      </div>

      <div className={styles.panelContent}>
        {isEmpty ? (
          <div className={styles.emptyPanel}>
            <span>No {variant} data</span>
          </div>
        ) : (
          entries.map(([key, value]) => (
            <DataField 
              key={key} 
              label={key} 
              value={value} 
              depth={0}
              accentColor={accentColor}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default DataPanel;
