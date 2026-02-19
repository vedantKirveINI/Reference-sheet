import React, { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
	const [isOpen, setIsOpen] = useState(false);

	const currentOption = useMemo(() => {
		return ROW_HEIGHT_OPTIONS.find((option) => option.level === value);
	}, [value]);

	const handleSelect = (level: RowHeightLevel) => {
		onChange?.(level);
		setIsOpen(false);
	};

	return (
		<div className={styles.rowHeightControl}>
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
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
				</PopoverTrigger>
				<PopoverContent
					align="start"
					style={{
						marginTop: "0.75rem",
						minWidth: "10rem",
						padding: "0.5rem 0",
					}}
				>
					<div className={styles.menuContainer}>
						<div className={styles.menuTitle}>
							<span
								style={{
									fontFamily: "Inter",
									color: "#424242",
									padding: "0.5rem 1rem",
									fontSize: "14px",
								}}
							>
								Select a row height
							</span>
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
										<span
											style={{
												fontFamily: "Inter",
												fontSize: "13px",
												fontWeight: "400",
												color: isActive ? "#607D8B" : "#212121",
												flex: 1,
											}}
										>
											{option.label}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default RowHeightControl;
