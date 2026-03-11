import React, { useMemo } from "react";
import styles from "./styles.module.css";
import StatusHeader from "./components/StatusHeader";
import DataPanel from "./components/DataPanel";

const normalizePayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  if (Array.isArray(payload)) {
    return { Items: payload };
  }
  return payload;
};

function ExecutionResultV3({ inputs, outputs, node, theme = {}, executedAt }) {
  const normalizedData = useMemo(() => {
    return {
      inputs: normalizePayload(inputs?.response || inputs),
      outputs: normalizePayload(outputs?.response || outputs),
    };
  }, [inputs, outputs]);

  const hasError = outputs?.error || outputs?.status === "error";
  const accentColor = theme.accentColor || "#3b82f6";
  const timestamp = executedAt || outputs?.executedAt || outputs?.timestamp || new Date().toISOString();

  return (
    <div className={styles.container}>
      <StatusHeader 
        hasError={hasError}
        nodeName={node?.name || node?.text || "Node"}
        theme={theme}
        executedAt={timestamp}
      />

      <div className={styles.splitPanel}>
        <DataPanel
          title="Input"
          data={normalizedData.inputs}
          accentColor={accentColor}
          variant="input"
        />
        <div className={styles.divider} />
        <DataPanel
          title="Output"
          data={normalizedData.outputs}
          accentColor={accentColor}
          variant="output"
          hasError={hasError}
        />
      </div>
    </div>
  );
}

export default ExecutionResultV3;
