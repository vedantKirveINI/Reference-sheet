import React, { useState, useRef, useEffect } from "react";
import classes from "./InlineAITrigger.module.css";

const InlineAITrigger = ({
  variables = {},
  functions = [],
  onFormulaGenerated = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const buildVariableContext = () => {
    const varList = [];
    Object.entries(variables).forEach(([category, items]) => {
      if (Array.isArray(items)) {
        items.forEach((item) => {
          varList.push({
            name: item.name || item.description || item.value,
            type: item.type || "any",
          });
        });
      }
    });
    return varList;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const variableContext = buildVariableContext();
      const response = await fetch("/api/ai-formula-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          variables: variableContext,
          functions: functions.map((f) => f.value || f.name),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate formula");
      }

      const data = await response.json();
      if (data.formula) {
        onFormulaGenerated(data.formula, data);
        setQuery("");
        setIsOpen(false);
      }
    } catch (err) {
      setError(err.message || "Failed to generate formula");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={classes.container}>
      <button
        type="button"
        className={`${classes.trigger} ${isOpen ? classes.triggerActive : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Generate formula with AI"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1L9.5 5.5L14 7L9.5 8.5L8 13L6.5 8.5L2 7L6.5 5.5L8 1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={classes.dropdown}>
          <form onSubmit={handleSubmit} className={classes.form}>
            <input
              ref={inputRef}
              type="text"
              className={classes.input}
              placeholder="Describe what you want to calculate..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={classes.submitButton}
              disabled={!query.trim() || isLoading}
            >
              {isLoading ? (
                <span className={classes.spinner} />
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 7H13M13 7L7 1M13 7L7 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </form>
          {error && <div className={classes.error}>{error}</div>}
        </div>
      )}
    </div>
  );
};

export default InlineAITrigger;
