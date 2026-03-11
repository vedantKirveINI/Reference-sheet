import DataRenderer from "./DataRenderer";
import CollapsibleContainerComponent from "./CollapsibleContainer";
import styles from "./KeyValueTable.module.css";
import { formatKey } from "./utils/formatKey";
import { shouldSkipKey } from "./utils/skipKeys";
import CopyContent from "../CopyContent";

const KeyValueTable = ({
  data,
  depth = 0,
  objectAsContainers = false,
  isRecord = false,
}) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const entries = Object.entries(data);
  if (entries.length === 0) {
    return null;
  }

  const tableRows = [];
  let hasHeader = false;

  for (const [key, value] of entries) {
    if (shouldSkipKey(key)) {
      continue;
    }

    const isPrimitive =
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean";

    if (isPrimitive) {
      tableRows.push(
        <tr key={key} className={styles.row}>
          <td className={styles.keyCell}>{formatKey(key)}</td>
          <td className={styles.valueCell}>
            <DataRenderer data={value} depth={depth + 1} isRecord={isRecord} />
            <span className={styles.copyIconCell}>
              <CopyContent data={value} />
            </span>
          </td>
        </tr>
      );
      hasHeader = true;
    } else {
      if (Array.isArray(value)) {
        tableRows.push(
          <tr key={key} className={`${styles.row} ${styles.noBottomBorder}`}>
            <td className={styles.keyCell}>{formatKey(key)}</td>
            <td className={styles.valueCell}>
              {value.length} Record{value.length !== 1 ? "s" : ""}
            </td>
          </tr>
        );
        tableRows.push(
          <tr
            key={`${key}-container`}
            className={`${styles.row} ${styles.containerRow}`}
          >
            <td colSpan="2" className={styles.containerCell}>
              <DataRenderer
                data={value}
                depth={depth + 1}
                objectAsContainers={objectAsContainers}
                isRecord={isRecord}
                keyName={key}
              />
            </td>
          </tr>
        );
      } else {
        if (Object.keys(value).length === 0) {
          continue;
        }

        if (isRecord) {
          const objectEntries = Object.entries(value);
          const inlineObjectDisplay = objectEntries.map(
            ([objKey, objValue]) => (
              <div key={objKey} className={styles.inlineObjectEntry}>
                {formatKey(objKey)}: {String(objValue)}
              </div>
            )
          );

          tableRows.push(
            <tr key={key} className={styles.row}>
              <td className={styles.keyCell}>{formatKey(key)}</td>
              <td className={styles.valueCell}>
                <div className={styles.inlineObject}>{inlineObjectDisplay}</div>
                <span className={styles.copyIconCell}>
                  <CopyContent data={JSON.stringify(value)} />
                </span>
              </td>
            </tr>
          );
        } else {
          tableRows.push(
            <tr key={key} className={`${styles.row} ${styles.containerRow}`}>
              <td colSpan="2" className={styles.containerCell}>
                <CollapsibleContainerComponent
                  title={formatKey(key)}
                  value={value}
                  depth={depth}
                  objectAsContainers={objectAsContainers}
                  isRecord={isRecord}
                />
              </td>
            </tr>
          );
        }
      }
      hasHeader = true;
    }
  }

  return (
    <table className={styles.table}>
      {hasHeader && (
        <thead>
          <tr>
            <th className={styles.headerCell}>Key</th>
            <th className={styles.headerCell}>Value</th>
          </tr>
        </thead>
      )}
      <tbody>{tableRows}</tbody>
    </table>
  );
};

export default KeyValueTable;
