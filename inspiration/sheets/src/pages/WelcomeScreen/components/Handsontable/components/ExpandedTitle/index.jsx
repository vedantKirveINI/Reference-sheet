import styles from "./styles.module.scss";

function ExpandedTitle({ rowIndex = 0 }) {
	return <div className={styles.title}>Record {rowIndex + 1}</div>;
}

export default ExpandedTitle;
