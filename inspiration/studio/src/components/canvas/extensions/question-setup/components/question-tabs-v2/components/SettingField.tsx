import { ReactNode } from "react";
import { styles } from "../styles";

interface SettingFieldProps {
  label?: string;
  description?: string;
  children: ReactNode;
}

const SettingField = ({ label, description, children }: SettingFieldProps) => {
  return (
    <div style={styles.settingRow}>
      {(label || description) && (
        <div>
          {label && <div style={styles.settingLabel}>{label}</div>}
          {description && (
            <div style={styles.settingDescription}>{description}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default SettingField;
