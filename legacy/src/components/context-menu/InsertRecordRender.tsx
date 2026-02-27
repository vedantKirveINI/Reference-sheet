// Insert Record Render Component - Inspired by Teable
// Simplified version without number input
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/components/RecordMenu.tsx (line 55-107)

import React from "react";
import styles from "./InsertRecordRender.module.scss";
// import ODSTextField from "oute-ds-text-field"; // Commented out - no longer needed

interface IInsertRecordRenderProps {
	onClick: (num: number) => void;
	icon: React.ReactElement;
	type: "InsertAbove" | "InsertBelow";
}

/**
 * InsertRecordRender - Component for inserting records
 * Simplified version without number input - always inserts 1 record
 */
export const InsertRecordRender: React.FC<IInsertRecordRenderProps> = ({
	onClick,
	icon,
	type,
}) => {
	// Removed number input state and handlers - always insert 1 record
	// const [num, setNumber] = useState(1);
	// const handleChange, handleKeyDown, handleClick handlers removed

	const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		// Always insert 1 record
		onClick(1);
	};

	const label =
		type === "InsertAbove" ? "Insert record above" : "Insert record below";

	return (
		<div
			className={styles.container}
			onClick={handleContainerClick}
			onMouseEnter={(e) => {
				e.currentTarget.style.backgroundColor = "#f5f5f5";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = "transparent";
			}}
		>
			<div className={styles.label_container}>
				<div className={styles.icon_container}>{icon}</div>
				<span className={styles.label_text}>{label}</span>
			</div>
			{/* Number input removed - always insert 1 record */}
			{/* <ODSTextField
				type="number"
				value={num.toString()}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onClick={handleClick}
				onFocus={(e) => e.stopPropagation()}
				size="small"
				inputProps={{
					min: 1,
					max: 1000,
				}}
				sx={{
					width: "56px",
					marginLeft: "8px",
					"& .MuiOutlinedInput-root": {
						height: "24px",
					},
					"& .MuiInputBase-input": {
						padding: "4px 8px",
						fontSize: "13px",
						textAlign: "center",
					},
				}}
			/> */}
		</div>
	);
};
