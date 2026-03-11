import React, { useState, useRef, useEffect } from "react";
import classes from "./AIAssistant.module.css";

const AI_STATES = {
  IDLE: "idle",
  PROCESSING: "processing",
  READY: "ready",
  ERROR: "error",
};

const AIAssistant = ({
  variables = {},
  functions = [],
  onFormulaGenerated = () => {},
}) => {
  const [query, setQuery] = useState("");
  const [aiState, setAiState] = useState(AI_STATES.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState([]);
  const inputRef = useRef(null);

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
    if (!query.trim() || aiState === AI_STATES.PROCESSING) return;

    setError(null);
    setResult(null);
    setProgress([]);
    setAiState(AI_STATES.PROCESSING);

    const steps = [
      { id: "understand", label: "Understanding request...", status: "active" },
      { id: "analyze", label: "Analyzing variables...", status: "pending" },
      { id: "generate", label: "Generating formula...", status: "pending" },
      { id: "validate", label: "Validating...", status: "pending" },
    ];
    setProgress(steps);

    try {
      const variableContext = buildVariableContext();

      await new Promise((r) => setTimeout(r, 400));
      setProgress((prev) =>
        prev.map((s) =>
          s.id === "understand"
            ? { ...s, status: "complete" }
            : s.id === "analyze"
            ? { ...s, status: "active" }
            : s
        )
      );

      await new Promise((r) => setTimeout(r, 300));
      setProgress((prev) =>
        prev.map((s) =>
          s.id === "analyze"
            ? { ...s, status: "complete" }
            : s.id === "generate"
            ? { ...s, status: "active" }
            : s
        )
      );

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

      setProgress((prev) =>
        prev.map((s) =>
          s.id === "generate"
            ? { ...s, status: "complete" }
            : s.id === "validate"
            ? { ...s, status: "active" }
            : s
        )
      );

      await new Promise((r) => setTimeout(r, 200));
      setProgress((prev) =>
        prev.map((s) => (s.id === "validate" ? { ...s, status: "complete" } : s))
      );

      setResult(data);
      setAiState(AI_STATES.READY);
    } catch (err) {
      setAiState(AI_STATES.ERROR);
      setError(err.message || "Failed to generate formula");
      setProgress((prev) =>
        prev.map((s) => (s.status === "active" ? { ...s, status: "error" } : s))
      );
    }
  };

  const handleInsert = () => {
    if (result?.formula) {
      onFormulaGenerated(result.formula, result);
      handleReset();
    }
  };

  const handleReset = () => {
    setQuery("");
    setAiState(AI_STATES.IDLE);
    setResult(null);
    setError(null);
    setProgress([]);
    inputRef.current?.focus();
  };

  const getStepIcon = (status) => {
    switch (status) {
      case "complete":
        return <span className={classes.iconComplete}>✓</span>;
      case "active":
        return <span className={classes.iconActive}>●</span>;
      case "error":
        return <span className={classes.iconError}>✕</span>;
      default:
        return <span className={classes.iconPending}>○</span>;
    }
  };

  return (
    <div className={classes.container}>
      <form className={classes.inputForm} onSubmit={handleSubmit}>
        <div className={classes.inputWrapper}>
          <span className={classes.aiIcon}>✦</span>
          <input
            ref={inputRef}
            type="text"
            className={classes.input}
            placeholder="Describe what you want to calculate..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={aiState === AI_STATES.PROCESSING}
          />
          {aiState === AI_STATES.PROCESSING ? (
            <button
              type="button"
              className={classes.cancelButton}
              onClick={handleReset}
            >
              Cancel
            </button>
          ) : (
            <button
              type="submit"
              className={classes.submitButton}
              disabled={!query.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 12V4M8 4L4 8M8 4L12 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </form>

      {progress.length > 0 && aiState === AI_STATES.PROCESSING && (
        <div className={classes.progressContainer}>
          {progress.map((step) => (
            <div
              key={step.id}
              className={`${classes.progressStep} ${classes[`step_${step.status}`]}`}
            >
              {getStepIcon(step.status)}
              <span className={classes.stepLabel}>{step.label}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className={classes.errorContainer}>
          <span className={classes.errorIcon}>⚠</span>
          <span className={classes.errorMessage}>{error}</span>
          <button className={classes.retryButton} onClick={handleReset}>
            Try again
          </button>
        </div>
      )}

      {result && aiState === AI_STATES.READY && (
        <div className={classes.resultContainer}>
          <div className={classes.formulaPreview}>
            <div className={classes.formulaLabel}>Generated Formula</div>
            <code className={classes.formulaCode}>{result.formula}</code>
          </div>

          {result.explanation && (
            <div className={classes.explanation}>
              <p className={classes.explanationText}>{result.explanation}</p>
            </div>
          )}

          <div className={classes.actionButtons}>
            <button className={classes.insertButton} onClick={handleInsert}>
              Insert formula
            </button>
            <button className={classes.modifyButton} onClick={handleReset}>
              Try different prompt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
