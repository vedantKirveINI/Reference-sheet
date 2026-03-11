import React from "react";
import styles from "./Chip.module.css";

interface ChipProps {
	label: string | null;
	backgroundColor: string;
	borderRadius: number;
	onTogglePopper: () => void;
}

export const Chip: React.FC<ChipProps> = ({
	label,
	backgroundColor,
	borderRadius,
	onTogglePopper,
}) => {
	return (
		<div
			className={styles.chip_container}
			onClick={(event) => {
				event.stopPropagation();
				onTogglePopper();
			}}
		>
			<div
				className={`${styles.scq_chip} ${
					label ? styles.filled : styles.empty
				}`}
				style={{
					backgroundColor: label ? backgroundColor : "transparent",
					borderRadius: `${borderRadius}px`,
				}}
			>
				{label ?? ""}
			</div>
		</div>
	);
};
