import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";

import { getChipsColor } from "../../../../../../../../utils/assignColours";
import { getDisplayValue, getItemKey, removeOption } from "../utils/helper";

import styles from "./styles.module.scss";

function Chips({
	options = [],
	visibleChips = [],
	handleSelectOption = () => {},
	src = "",
	limitValue = "",
	isWrapped = false,
	limitValueChipWidth = 0,
}) {
	return (
		<div
			className={`${styles.chips_container} ${src === "expandedView" ? styles.expanded_view_chips : ""} ${isWrapped ? styles.wrap : ""}`}
			style={{ maxWidth: `calc(100% - ${limitValueChipWidth + 28}px)` }} // to keep the chip container width precise according to limitvalue chip size
		>
			{(!isEmpty(visibleChips) ? visibleChips : options).map(
				(option, index) => {
					const bgColor = getChipsColor({ index, type: "dropdown" }); // type passes as dropdown for bg colours
					const displayValue = getDisplayValue(option);
					const itemKey = getItemKey({ item: option, index });

					return (
						<div
							key={itemKey}
							className={styles.chip}
							style={{
								backgroundColor: bgColor,
							}}
						>
							<span className={styles.chip_text}>
								{displayValue}
							</span>

							<ODSIcon
								onClick={() => {
									let optionLabel = "";
									if (
										typeof option === "object" &&
										option?.label
									) {
										optionLabel = option?.label;
									} else {
										optionLabel = option;
									}

									const updatedOptions = removeOption({
										optionsList: options,
										optionToRemove: optionLabel,
									});

									handleSelectOption(updatedOptions);
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
