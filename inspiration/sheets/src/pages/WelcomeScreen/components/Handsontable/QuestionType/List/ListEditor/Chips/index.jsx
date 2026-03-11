import isEmpty from "lodash/isEmpty";
import Icon from "oute-ds-icon";

import { getChipsColor } from "../../../../../../../../utils/assignColours";

import styles from "./styles.module.scss";

function Chips({
	options = [],
	visibleChips = [],
	handleSelectOption,
	src = "",
	limitValue = "",
	isWrapped = false,
	limitValueChipWidth = 0,
}) {
	const removeOption = (opt) => {
		const updatedOptions = options.filter((option) => option !== opt);

		handleSelectOption(updatedOptions);
	};

	return (
		<div
			className={`${styles.chips_container} ${src === "expandedView" ? styles.expanded_view_chips : ""} ${isWrapped ? styles.wrap : ""}`}
			style={{ maxWidth: `calc(100% - ${limitValueChipWidth + 28}px)` }} // to keep the chip container width precise according to limitvalue chip size
		>
			{(!isEmpty(visibleChips) ? visibleChips : options).map(
				(option, index) => {
					const bgColor = getChipsColor({ index, type: "mcq" });

					return (
						<div
							key={`${option}_${index}`}
							className={styles.chip}
							style={{
								backgroundColor: bgColor,
							}}
						>
							<span className={styles.chip_text}>{option}</span>

							<Icon
								onClick={() => {
									removeOption(option);
								}}
								outeIconName="OUTECloseIcon"
								outeIconProps={{
									sx: {
										width: "20px",
										height: "20px",
										color: "#607D8B",
									},
								}}
								buttonProps={{
									sx: {
										padding: 0,
									},
								}}
							/>
						</div>
					);
				},
			)}

			{limitValue && !isEmpty(visibleChips) && (
				<span className={`${styles.chip} ${styles.limit_value_chip}`}>
					{limitValue}
				</span>
			)}
		</div>
	);
}

export default Chips;
