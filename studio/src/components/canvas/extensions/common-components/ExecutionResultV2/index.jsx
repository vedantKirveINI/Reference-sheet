import React, { useMemo } from "react";
import styles from "./styles.module.css";
import DataCluster from "./component/DataCluster";

const normalizePayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  if (Array.isArray(payload)) {
    return { Items: payload };
  }

  return payload;
};

function ExecutionResultV2({ inputs, outputs }) {
  const normalizedData = useMemo(() => {
    return {
      inputs: normalizePayload(inputs?.response || inputs),
      outputs: normalizePayload(outputs?.response || outputs),
    };
  }, [inputs, outputs]);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.subtitle}>
          See how your node processed the test data. Compare the inputs you
          provided with the outputs generated to verify everything works as
          expected.
        </p>
      </header>

      <section className={styles.grid}>
        <DataCluster
          label="Test Inputs"
          payload={normalizedData.inputs}
          isOutput={false}
        />

        <DataCluster
          label="Test Results"
          payload={normalizedData.outputs}
          isOutput={true}
        />
      </section>
    </div>
  );
}

export default ExecutionResultV2;
