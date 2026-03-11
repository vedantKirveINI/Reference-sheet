import SchemaInputV2 from "./SchemaInputV2";
import styles from "./ObjectInputV2.module.css";

const ObjectInputV2 = ({
  label,
  value = {},
  schema,
  onValueChange,
  renderInput,
  getActualKey,
}) => {
  return (
    <div className={styles.objectContainer}>
      <div className={styles.objectHeader}>
        <h4 className={styles.objectTitle}>{label}</h4>
        <span className={styles.objectTypeBadge}>Object</span>
      </div>
      <div className={styles.objectContent}>
        <SchemaInputV2
          schema={schema}
          value={value}
          onValuesChange={onValueChange}
        />
      </div>
    </div>
  );
};

export default ObjectInputV2;
