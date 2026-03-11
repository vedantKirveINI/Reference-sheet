import React, { useState, useCallback, useMemo } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";

const DataPanel = ({
  title,
  data,
  accentColor = "#3b82f6",
  variant = "input",
  hasError = false,
  searchQuery = "",
}) => {
  const [expandedPaths, setExpandedPaths] = useState({});
  const [copiedPath, setCopiedPath] = useState(null);

  const togglePath = useCallback((path) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  }, []);

  const handleCopy = useCallback(async (value, path) => {
    try {
      const textValue = typeof value === "object" 
        ? JSON.stringify(value, null, 2) 
        : String(value);
      await navigator.clipboard.writeText(textValue);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch (e) {
    }
  }, []);

  const matchesSearch = useCallback((key, value) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (key.toLowerCase().includes(query)) return true;
    if (typeof value === "string" && value.toLowerCase().includes(query)) return true;
    if (typeof value === "number" && String(value).includes(query)) return true;
    return false;
  }, [searchQuery]);

  const renderValue = useCallback((value, path = "", depth = 0) => {
    if (value === null) {
      return <span className={styles.nullValue}>null</span>;
    }

    if (value === undefined) {
      return <span className={styles.undefinedValue}>undefined</span>;
    }

    if (typeof value === "boolean") {
      return (
        <span className={cn(styles.booleanValue, value ? styles.trueValue : styles.falseValue)}>
          {String(value)}
        </span>
      );
    }

    if (typeof value === "number") {
      return <span className={styles.numberValue}>{value}</span>;
    }

    if (typeof value === "string") {
      if (value.length > 100) {
        return (
          <span className={styles.stringValue} title={value}>
            "{value.slice(0, 100)}..."
          </span>
        );
      }
      return <span className={styles.stringValue}>"{value}"</span>;
    }

    if (Array.isArray(value)) {
      const isExpanded = expandedPaths[path] ?? depth < 1;
      
      return (
        <div className={styles.arrayContainer}>
          <button
            className={styles.expandButton}
            onClick={() => togglePath(path)}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <span className={styles.arrayLabel}>
              Array [{value.length}]
            </span>
          </button>
          
          {isExpanded && (
            <div className={styles.nestedContent}>
              {value.map((item, index) => (
                <div key={index} className={styles.arrayItem}>
                  <span className={styles.arrayIndex}>[{index}]</span>
                  {renderValue(item, `${path}[${index}]`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === "object") {
      const keys = Object.keys(value);
      const isExpanded = expandedPaths[path] ?? depth < 1;

      return (
        <div className={styles.objectContainer}>
          <button
            className={styles.expandButton}
            onClick={() => togglePath(path)}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <span className={styles.objectLabel}>
              Object {"{"}
              {keys.length}
              {"}"}
            </span>
          </button>

          {isExpanded && (
            <div className={styles.nestedContent}>
              {keys.map((key) => {
                const childPath = path ? `${path}.${key}` : key;
                const childValue = value[key];
                const matches = matchesSearch(key, childValue);

                if (searchQuery && !matches) return null;

                return (
                  <div 
                    key={key} 
                    className={cn(
                      styles.objectEntry,
                      searchQuery && matches && styles.highlighted
                    )}
                  >
                    <div className={styles.entryHeader}>
                      <span className={styles.objectKey}>{key}:</span>
                      <button
                        className={styles.copyButton}
                        onClick={() => handleCopy(childValue, childPath)}
                        title="Copy value"
                      >
                        {copiedPath === childPath ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    {renderValue(childValue, childPath, depth + 1)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  }, [expandedPaths, togglePath, handleCopy, copiedPath, matchesSearch, searchQuery]);

  const isEmpty = !data || Object.keys(data).length === 0;

  return (
    <div 
      className={cn(
        styles.dataPanel,
        variant === "input" ? styles.inputPanel : styles.outputPanel,
        hasError && styles.errorPanel
      )}
    >
      <div 
        className={styles.panelHeader}
        style={{ "--accent-color": accentColor }}
      >
        <span className={styles.panelTitle}>{title}</span>
      </div>

      <div className={styles.panelContent}>
        {isEmpty ? (
          <div className={styles.emptyPanel}>
            <span>No data</span>
          </div>
        ) : (
          <div className={styles.dataTree}>
            {Object.entries(data).map(([key, value]) => {
              const matches = matchesSearch(key, value);
              if (searchQuery && !matches && typeof value !== "object") return null;

              return (
                <div 
                  key={key} 
                  className={cn(
                    styles.rootEntry,
                    searchQuery && matches && styles.highlighted
                  )}
                >
                  <div className={styles.entryHeader}>
                    <span className={styles.rootKey}>{key}:</span>
                    <button
                      className={styles.copyButton}
                      onClick={() => handleCopy(value, key)}
                      title="Copy value"
                    >
                      {copiedPath === key ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  {renderValue(value, key, 0)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPanel;
