import { ODSLabel as Typography } from "@src/module/ods";
import styles from "./FieldDescription.module.css";

export function FieldDescription({ children }) {
  return (
    <Typography variant="body2" className={styles.fieldDescription}>
      {children}
    </Typography>
  );
}
