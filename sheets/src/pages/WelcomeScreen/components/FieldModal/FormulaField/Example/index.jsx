import styles from "./styles.module.scss";

const Example = () => {
	return (
		<div className={styles.formula_example}>
			<span style={{ color: "black" }}>Example: </span>
			<span>{`Amount * Price AVERAGE(field1, field2) Name & "-" & Date IF(Price * Quantity > 5, "Yes", "No")`}</span>
		</div>
	);
};

export default Example;
