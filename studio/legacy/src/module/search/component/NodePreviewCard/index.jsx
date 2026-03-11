import React from "react";
import { motion, AnimatePresence } from "framer-motion";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "../../../ods";
import styles from "./styles.module.css";

const SAMPLE_DATA = {
  HTTP: {
    input: { url: "https://api.example.com/data", method: "GET" },
    output: { status: 200, body: { users: ["..."] } },
    fields: ["URL", "Method", "Headers", "Body"],
  },
  TRANSFORMER: {
    input: { raw_data: { name: "John", age: 30 } },
    output: { formatted: "John (30)" },
    fields: ["Transformation Script", "Input Mapping"],
  },
  IF_ELSE_V2: {
    input: { value: 150 },
    output: { branch: "true", passed: true },
    fields: ["Condition", "True Path", "False Path"],
  },
  ITERATOR: {
    input: { items: [1, 2, 3, 4, 5] },
    output: { current_item: 1, index: 0 },
    fields: ["Array to Iterate", "Max Iterations"],
  },
  TINY_GPT: {
    input: { prompt: "Summarize this text..." },
    output: { response: "AI generated summary..." },
    fields: ["Prompt", "Model", "Temperature"],
  },
  FIND_ALL: {
    input: { table: "users", filter: { status: "active" } },
    output: { records: [{ id: 1 }, { id: 2 }], count: 2 },
    fields: ["Table", "Filter Conditions", "Sort"],
  },
  UPSERT: {
    input: { table: "users", data: { name: "John" } },
    output: { id: 123, created: true },
    fields: ["Table", "Record Data", "Unique Key"],
  },
  SEND_EMAIL: {
    input: { to: "user@example.com", subject: "Hello" },
    output: { sent: true, messageId: "abc123" },
    fields: ["To", "Subject", "Body", "Attachments"],
  },
};

const DEFAULT_DATA = {
  input: { data: "..." },
  output: { result: "..." },
  fields: ["Configuration"],
};

const NodePreviewCard = ({ node, isVisible, position = { x: 0, y: 0 } }) => {
  if (!node || !isVisible) return null;

  const sampleData = SAMPLE_DATA[node.type] || SAMPLE_DATA[node.subType] || DEFAULT_DATA;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.container}
          style={{
            left: position.x,
            top: position.y,
          }}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
        >
          <div className={styles.header}>
            <div className={styles.nodeIcon}>
              <Icon
                imageProps={{
                  src: node._src,
                  style: { width: "1.5rem", height: "1.5rem" },
                }}
              />
            </div>
            <div className={styles.nodeInfo}>
              <h4 className={styles.nodeName}>{node.name}</h4>
              <span className={styles.nodeType}>{node.type}</span>
            </div>
          </div>

          {node.description && (
            <p className={styles.description}>{node.description}</p>
          )}

          <div className={styles.dataSection}>
            <div className={styles.dataBlock}>
              <span className={styles.dataLabel}>
                <Icon outeIconName="OUTEInputIcon" sx={{ fontSize: "0.75rem" }} />
                Sample Input
              </span>
              <pre className={styles.dataCode}>
                {JSON.stringify(sampleData.input, null, 2)}
              </pre>
            </div>

            <div className={styles.dataBlock}>
              <span className={styles.dataLabel}>
                <Icon outeIconName="OUTEOutputIcon" sx={{ fontSize: "0.75rem" }} />
                Sample Output
              </span>
              <pre className={styles.dataCode}>
                {JSON.stringify(sampleData.output, null, 2)}
              </pre>
            </div>
          </div>

          <div className={styles.fieldsSection}>
            <span className={styles.fieldsLabel}>Key Configuration</span>
            <div className={styles.fieldsList}>
              {sampleData.fields.map((field, i) => (
                <span key={i} className={styles.fieldTag}>
                  {field}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.footer}>
            <span className={styles.hint}>
              <Icon outeIconName="OUTEKeyboardIcon" sx={{ fontSize: "0.75rem" }} />
              Press Enter to add
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NodePreviewCard;
