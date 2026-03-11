import KeyValueTable from "./KeyValueTable";
import ArrayAccordion from "./ArrayAccordion";
import PrimitiveRenderer from "./PrimitiveRenderer";
import CollapsibleContainerComponent from "./CollapsibleContainer";
import styles from "./DataRenderer.module.css"; // Import styles for containerList class
import { formatKey } from "./utils/formatKey";

const DataRenderer = ({
  data,
  objectAsContainers = false,
  depth = 0,
  isRecord = false,
  keyName,
  showCopyIcon = false,
}) => {
  // Handle null or undefined
  if (data === null || data === undefined) {
    return <PrimitiveRenderer value={data} />;
  }

  // Handle primitive types
  if (typeof data !== "object") {
    return <PrimitiveRenderer value={data} showCopyIcon={showCopyIcon} />;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    // Pass keyName prop to ArrayAccordion for singular labeling
    return (
      <ArrayAccordion
        data={data}
        depth={depth}
        isRecord={isRecord}
        keyName={keyName}
      />
    );
  }

  if (Object.keys(data).length === 0) {
    return null;
  }

  if (objectAsContainers && depth === 0) {
    return (
      <div className={styles.containerList}>
        {Object.entries(data).map(([key, value]) => (
          <CollapsibleContainerComponent
            key={key}
            title={formatKey(key)}
            value={value}
            depth={depth}
            objectAsContainers={false} // Prevent recursive container mode
            isRecord={isRecord} // Pass isRecord prop to CollapsibleContainer
          />
        ))}
      </div>
    );
  }

  return <KeyValueTable data={data} depth={depth} isRecord={isRecord} />;
};

export default DataRenderer;
