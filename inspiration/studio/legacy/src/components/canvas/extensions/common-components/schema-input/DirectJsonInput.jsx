import { useState, useEffect } from "react";
import CollapsibleHeader from "./CollapsibleHeader";
import styles from "./DirectJsonInput.module.css";
// import Label from "oute-ds-label";
import { ODSLabel as Label } from "@src/module/ods";

const DirectJsonInput = ({ label, value, onValueChange, type = "object" }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");

  // Initialize jsonText from value
  useEffect(() => {
    if (value !== undefined && value !== null) {
      try {
        setJsonText(JSON.stringify(value, null, 2));
      } catch (e) {
        setJsonText(String(value));
      }
    } else {
      setJsonText(type === "array" ? "[]" : "{}");
    }
  }, [value, type]);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleJsonChange = (e) => {
    const newText = e.target.value;
    setJsonText(newText);

    try {
      const parsed = JSON.parse(newText);

      // Validate type
      if (type === "array" && !Array.isArray(parsed)) {
        setError("Expected an array");
        return;
      }
      if (
        type === "object" &&
        (Array.isArray(parsed) || typeof parsed !== "object" || parsed === null)
      ) {
        setError("Expected an object");
        return;
      }

      setError("");
      onValueChange(parsed);
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`);
    }
  };

  const placeholder =
    type === "array"
      ? `[\n  "item1",\n  "item2"\n]`
      : `{\n  "key": "value",\n  "number": 123\n}`;

  return (
    <div className={styles.directJsonGroup}>
      <CollapsibleHeader
        isCollapsed={isCollapsed}
        onToggle={handleToggleCollapse}
        title={`${label} (Direct ${type} input)`}
      />

      {!isCollapsed && (
        <div className={styles.jsonInputContainer}>
          {/* <div className={styles.helpText}> */}
          <Label>Schema not defined. Enter the complete {type} as JSON:</Label>
          {/* </div> */}

          <textarea
            className={`${styles.jsonTextarea} ${error ? styles.error : ""}`}
            value={jsonText}
            onChange={handleJsonChange}
            placeholder={placeholder}
            rows={6}
          />

          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
      )}
    </div>
  );
};

export default DirectJsonInput;
