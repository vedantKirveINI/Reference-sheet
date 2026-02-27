import styles from "./styles.module.scss";

function Chip({
	selectedOption = "",
	optionBackgroundColour = {},
	wrapClass = "",
	borderRadius = "",
	setPopperOpen,
}) {
	return (
		<div
			className={styles.chip_container}
			onClick={() => setPopperOpen((prev) => !prev)}
		>
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
