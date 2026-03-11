import styles from "./styles.module.scss";

function FilterWrapper({ children, className = "" }) {
	return (
		<div className={`${styles.filter_wrapper} ${className}`}>
			{children}
		</div>
	);
}

export default FilterWrapper;
