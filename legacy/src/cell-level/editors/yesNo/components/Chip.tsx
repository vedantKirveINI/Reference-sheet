import { FC } from "react";
import { YES_NO_COLOUR_MAPPING } from "@/constants/colours";
import styles from "./Chip.module.css";

interface ChipProps {
	value: string | null;
	onTogglePopper: () => void;
}

export const Chip: FC<ChipProps> = ({ value, onTogglePopper }) => {
	const backgroundColor = value
		? YES_NO_COLOUR_MAPPING[value as keyof typeof YES_NO_COLOUR_MAPPING]
		: "transparent";
	const isEmpty = !value;
	const label = value ?? "Select";

	return (
		<div
			className={styles.chip_container}
			onClick={(event) => {
				event.stopPropagation();
				onTogglePopper();
			}}
		>
			<div
				className={`${styles.chip} ${value ? styles.filled : styles.empty}`}
				style={{ backgroundColor }}
			>
				{isEmpty ? (
					<span className={styles.placeholder_text}>
						<span className={styles.placeholder_paren}>(</span>
						{label}
						<span className={styles.placeholder_paren}>)</span>
					</span>
				) : (
					label
				)}
			</div>
		</div>
	);
};
