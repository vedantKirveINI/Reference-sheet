import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings } from "lucide-react";
import styles from "./styles.module.scss";

export const CustomizeCardsButton: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<div className={styles.kanbanControlButton}>
					<Settings
						style={{
							width: "1rem",
							height: "1rem",
							color: "#666",
						}}
					/>
					<span className={styles.kanbanControlLabel}>
						Customize cards
					</span>
				</div>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				style={{
					minWidth: "250px",
					padding: "8px",
				}}
			>
				<div className={styles.popoverContent}>
					<div className={styles.popoverText}>
						Customize card display options
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};
