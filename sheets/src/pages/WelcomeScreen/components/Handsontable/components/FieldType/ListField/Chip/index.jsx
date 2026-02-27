import ODSIcon from "oute-ds-icon";

import { getChipsColor } from "../../../../../../../../utils/assignColours";

import styles from "./styles.module.scss";

function Chip({ option = "", index, onRemove = () => {} }) {
	const bgColor = getChipsColor({
		index,
	});

	return (
		<div
			key={`${option}_${index}`}
			className={styles.chip}
			style={{ backgroundColor: bgColor }}
		>
			<span className={styles.chip_label}>{option}</span>
			<ODSIcon
				outeIconName="OUTECloseIcon"
				outeIconProps={{
					sx: {
						width: "1.25rem",
						height: "1.25rem",
						cursor: "pointer",
					},
				}}
				buttonProps={{
					sx: {
						padding: 0,
					},
				}}
				onClick={(e) => {
					e.stopPropagation();
					onRemove(option);
				}}
			/>
		</div>
	);
}

export default Chip;
