import React, { useState, useRef, useEffect } from "react";
import classes from "./AIAssistant.module.css";

const AI_STATES = {
  IDLE: "idle",
  CAPTURING_INTENT: "capturing_intent",
  GROUNDING: "grounding",
  SYNTHESIZING: "synthesizing",
  VALIDATING: "validating",
  READY: "ready",
  ERROR: "error",
};

const AIAssistant = ({
  variables = {},
  functions = [],
  onFormulaGenerated = () => {},
  onClose = () => {},
}) => {
  const [query, setQuery] = useState("");
  const [aiState, setAiState] = useState(AI_STATES.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [journeySteps, setJourneySteps] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const buildVariableContext = () => {
    const varList = [];
    Object.entries(variables).forEach(([category, items]) => {
      if (Array.isArray(items)) {
        items.forEach((item) => {
          varList.push({
            name: item.name || item.description || item.value,
            type: item.type || "any",
            nullable: item.nullable ?? true,
          });
        });
      } else if (items && typeof items === "object") {
        Object.entries(items).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              varList.push({
                name: item.name || item.description || item.value,
                type: item.type || "any",
                nullable: item.nullable ?? true,
              });
            });
          }
        });
      }
    });
    return varList;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!query.trim() || aiState !== AI_STATES.IDLE) return;

    setError(null);
    setResult(null);
    setJourneySteps([]);

    try {
      setAiState(AI_STATES.CAPTURING_INTENT);
      setJourneySteps([
        { step: "intent", status: "active", message: "Understanding your request..." },
      ]);

      const variableContext = buildVariableContext();

      const response = await fetch("/api/ai-formula-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          variables: variableContext,
          functions: functions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to process request");
      }

      const data = await response.json();

      const steps = [];
      
      steps.push({
        step: "intent",
        status: "complete",
        message: data.intent?.goal || "Intent captured",
      });

      const matchedVars = data.grounding?.matchedVariables || [];
      const unmatchedVars = data.grounding?.unmatchedVariables || [];
      
      if (unmatchedVars.length > 0) {
        steps.push({
          step: "grounding",
          status: "warning",
          message: `Unknown variables: ${unmatchedVars.join(", ")}`,
        });
      } else {
        steps.push({
          step: "grounding",
          status: "complete",
          message: matchedVars.length > 0 ? `Found: ${matchedVars.join(", ")}` : "No variables needed",
        });
      }

      steps.push({
        step: "synthesis",
        status: data.formula ? "complete" : "error",
        message: data.formula ? "Formula synthesized" : "Failed to generate formula",
      });

      const validation = data.validation || {};
      const validationErrors = validation.errors || [];
      const validationWarnings = validation.warnings || [];
      
      if (!validation.isValid) {
        steps.push({
          step: "validation",
          status: "error",
          message: validationErrors[0] || "Validation failed",
        });
        setAiState(AI_STATES.ERROR);
        setError(validationErrors.join(". ") || "Formula validation failed");
      } else if (validationWarnings.length > 0) {
        steps.push({
          step: "validation",
          status: "warning",
          message: validationWarnings[0],
        });
        setAiState(AI_STATES.READY);
        setResult(data);
      } else {
        steps.push({
          step: "validation",
          status: "complete",
          message: "Formula is valid and safe",
        });
        setAiState(AI_STATES.READY);
        setResult(data);
      }

      steps.push({
        step: "acceptance",
        status: validation.isValid ? "pending" : "blocked",
        message: validation.isValid ? "Ready for your review" : "Cannot insert - fix errors first",
      });

      setJourneySteps(steps);
    } catch (err) {
      setAiState(AI_STATES.ERROR);
      setError(err.message || "Failed to generate formula");
      setJourneySteps((prev) =>
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
    setJourneySteps([]);
    inputRef.current?.focus();
  };

  const getStepIcon = (status) => {
    switch (status) {
      case "complete":
        return "✓";
      case "active":
        return "○";
      case "warning":
        return "⚠";
      case "error":
        return "✕";
      case "pending":
        return "→";
      case "blocked":
        return "⊘";
      default:
        return "○";
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
            placeholder="Write, fix, or explain a formula..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={aiState !== AI_STATES.IDLE && aiState !== AI_STATES.ERROR}
          />
          <button
            type="submit"
            className={classes.submitButton}
            disabled={!query.trim() || (aiState !== AI_STATES.IDLE && aiState !== AI_STATES.ERROR)}
          >
            ↑
          </button>
        </div>
      </form>

      {journeySteps.length > 0 && (
        <div className={classes.journeyContainer}>
          <div className={classes.journeySteps}>
            {journeySteps.map((step, index) => (
              <div
                key={step.step}
                className={`${classes.journeyStep} ${classes[`step_${step.status}`]}`}
              >
                <span className={classes.stepIcon}>{getStepIcon(step.status)}</span>
                <span className={classes.stepMessage}>{step.message}</span>
              </div>
            ))}
          </div>
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
              <div className={classes.explanationLabel}>Explanation</div>
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
