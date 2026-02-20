import React, { useRef, useState } from "react";
import Icon from "oute-ds-icon";
import Popover from "oute-ds-popover";
import styles from "./styles.module.scss";

export const CustomizeCardsButton: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLDivElement | null>(null);

	return (
		<>
			<div
				className={styles.kanbanControlButton}
				onClick={() => setIsOpen(!isOpen)}
				ref={buttonRef}
			>
				<Icon
					outeIconName="OUTESettingsIcon"
					outeIconProps={{
						sx: {
							width: "1rem",
							height: "1rem",
							color: "#666",
						},
					}}
				/>
				<span className={styles.kanbanControlLabel}>
					Customize cards
				</span>
			</div>

			<Popover
				open={isOpen}
				anchorEl={buttonRef?.current}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				placement="bottom-start"
				onClose={() => setIsOpen(false)}
				sx={{ zIndex: 200 }}
				slotProps={{
					paper: {
						sx: {
							border: "0.047rem solid #CFD8DC",
							marginTop: "0.875rem",
							minWidth: "250px",
							padding: "8px",
						},
					},
				}}
			>
				<div className={styles.popoverContent}>
					<div className={styles.popoverText}>
						Customize card display options
					</div>
					{/* TODO: Add card customization UI (cover field, field visibility, etc.) */}
				</div>
			</Popover>
		</>
	);
};

