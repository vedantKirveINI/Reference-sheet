import styles from "./PrimitiveRenderer.module.css";
import CopyContent from "../CopyContent";

const PrimitiveRenderer = ({ value, showCopyIcon = false }) => {
  const renderValue = () => {
    if (value === null) {
      return <span className={styles.null}>null</span>;
    }

    if (value === undefined) {
      return <span className={styles.undefined}>undefined</span>;
    }

    if (typeof value === "boolean") {
      return <span className={styles.boolean}>{value.toString()}</span>;
    }

    if (typeof value === "number") {
      return <span className={styles.number}>{value}</span>;
    }

    if (typeof value === "string") {
      return <span className={styles.string}>{value}</span>;
    }

    return <span className={styles.unknown}>{String(value)}</span>;
  };

  return (
    <div className={styles.primitive}>
      {renderValue()}
      {showCopyIcon && (
        <span className={styles.copyIconCell}>
          <CopyContent data={value} />
        </span>
      )}
    </div>
  );
};

export default PrimitiveRenderer;
