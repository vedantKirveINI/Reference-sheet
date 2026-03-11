import styles from "./styles.module.scss";

function Chip({
	selectedOption = "",
	optionBackgroundColour = {},
	wrapClass = "ellipses",
	borderRadius = "",
}) {
	return (
		<div className={styles.chip_container}>
			<div
				className={`${styles.scq_chip} ${styles[wrapClass]}`}
				style={{
					backgroundColor: `${optionBackgroundColour[selectedOption]}`,
					borderRadius,
				}}
			>
				{selectedOption}
			</div>
		</div>
	);
}

export default Chip;
