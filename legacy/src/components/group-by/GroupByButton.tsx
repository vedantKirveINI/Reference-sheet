import React, { useMemo, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useGroupByPlaygroundStore } from "@/stores/groupByPlaygroundStore";
import GroupByPanel from "./GroupByPanel";
import styles from "./GroupByButton.module.scss";
import { GROUP_COLUMN_BG } from "@/theme/grouping";

interface GroupByButtonProps {
	fields?: Array<{ id: number; name: string; type: string }>;
}

export const GroupByButton: React.FC<GroupByButtonProps> = ({
	fields = [],
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const { groupConfig } = useGroupByPlaygroundStore();

	const isActive = useMemo(() => {
		return groupConfig !== null && (groupConfig.groupObjs?.length ?? 0) > 0;
	}, [groupConfig]);

	const groupText = useMemo(() => {
		if (!isActive) return "Group";
		const count = groupConfig?.groupObjs?.length ?? 0;
		return count === 1 ? "1 group" : `${count} groups`;
	}, [isActive, groupConfig]);

	return (
		<div className={styles.groupByButton}>
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						data-testid="group-by-button-trigger"
						style={{
							backgroundColor: isActive ? GROUP_COLUMN_BG : undefined,
							color: "#000000",
							border: isActive ? "1.5px solid #a78bfa" : undefined,
						}}
					>
						{groupText}
						<span className={styles.dropdownIcon}>▾</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					style={{ minWidth: "400px", maxWidth: "500px", padding: 0 }}
				>
					<GroupByPanel fields={fields} />
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default GroupByButton;
