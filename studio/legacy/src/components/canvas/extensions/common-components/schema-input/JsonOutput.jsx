import styles from "./JsonOutput.module.css";

const JsonOutput = ({ title = "Current Values", value }) => {
  return (
    <div className={styles.output}>
      <h4 className={styles.title}>{title}</h4>
      <pre className={styles.jsonOutput}>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};

export default JsonOutput;
