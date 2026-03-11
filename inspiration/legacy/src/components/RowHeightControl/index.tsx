import React, { useMemo, useState } from "react";
import ODSPopover from "oute-ds-popover";
import ODSLabel from "oute-ds-label";
import { RowHeightLevel } from "@/types";
import { RowHeightIcon } from "./RowHeightIcon";
import styles from "./styles.module.scss";

interface IRowHeightOption {
	level: RowHeightLevel;
	label: string;
}

interface RowHeightControlProps {
	value: RowHeightLevel;
	onChange?: (level: RowHeightLevel) => void;
}

const ROW_HEIGHT_OPTIONS: IRowHeightOption[] = [
	{
		level: RowHeightLevel.Short,
		label: "Short",
	},
	{
		level: RowHeightLevel.Medium,
		label: "Medium",
	},
	{
		level: RowHeightLevel.Tall,
		label: "Tall",
	},
	{
		level: RowHeightLevel.ExtraTall,
		label: "Extra Tall",
	},
];

export const RowHeightControl: React.FC<RowHeightControlProps> = ({
	value,
	onChange,
}) => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

	const currentOption = useMemo(() => {
		return ROW_HEIGHT_OPTIONS.find((option) => option.level === value);
	}, [value]);

	const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleSelect = (level: RowHeightLevel) => {
		onChange?.(level);
		handleClose();
	};

	return (
		<div className={styles.rowHeightControl}>
			<button
				type="button"
				onClick={handleOpen}
				className={styles.triggerButton}
				data-testid="row-height-control-trigger"
				aria-label={`Row height: ${currentOption?.label ?? "Short"}`}
			>
				<RowHeightIcon
					level={value}
					isSelected={true}
					size={16}
				/>
			<span className={styles.triggerLabel}>Row size</span>
			</button>
			
			<ODSPopover
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
				slotProps={{
					paper: {
						style: {
							marginTop: "0.75rem",
							minWidth: "10rem",
							padding: "0.5rem 0",
							boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
						},
					},
				}}
			>
				<div className={styles.menuContainer}>
					<div className={styles.menuTitle}>
						<ODSLabel
							variant="body2"
							sx={{
								fontFamily: "Inter",
								color: "#424242",
								padding: "0.5rem 1rem",
							}}
						>
							Select a row height
						</ODSLabel>
					</div>
					<div className={styles.menuOptions}>
						{ROW_HEIGHT_OPTIONS.map((option) => {
							const isActive = option.level === value;
							return (
								<button
									type="button"
									key={option.level}
									onClick={() => handleSelect(option.level)}
									className={`${styles.menuItem} ${
										isActive ? styles.menuItemActive : ""
									}`}
									data-testid={`row-height-option-${option.level}`}
								>
									<div className={styles.menuItemIcon}>
										<RowHeightIcon
											level={option.level}
											isSelected={isActive}
											size={16}
										/>
									</div>
									<ODSLabel
										variant="body2"
										sx={{
											fontFamily: "Inter",
											fontSize: "13px",
											fontWeight: "400",
											color: isActive ? "#607D8B" : "#212121",
											flex: 1,
										}}
									>
										{option.label}
									</ODSLabel>
								</button>
							);
						})}
					</div>
				</div>
			</ODSPopover>
		</div>
	);
};

export default RowHeightControl;
