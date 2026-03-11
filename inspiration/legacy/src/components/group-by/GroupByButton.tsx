// Phase 1: GroupBy Button Component (similar to RowHeightControl)
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/tool-bar/components/GridViewOperators.tsx

import React, { useMemo, useState } from "react";
import ODSPopover from "oute-ds-popover";
import ODSButton from "oute-ds-button";
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
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const { groupConfig } = useGroupByPlaygroundStore();

	const isActive = useMemo(() => {
		return groupConfig !== null && (groupConfig.groupObjs?.length ?? 0) > 0;
	}, [groupConfig]);

	const groupText = useMemo(() => {
		if (!isActive) return "Group";
		const count = groupConfig?.groupObjs?.length ?? 0;
		return count === 1 ? "1 group" : `${count} groups`;
	}, [isActive, groupConfig]);

	const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<div className={styles.groupByButton}>
			<ODSButton
				variant="text"
				label={groupText}
				onClick={handleOpen}
				endIcon={<span className={styles.dropdownIcon}>▾</span>}
				data-testid="group-by-button-trigger"
				sx={{
					backgroundColor: isActive ? GROUP_COLUMN_BG : undefined,
					color: "#000000 !important", // Keep text black (important to override theme)
					border: isActive ? "1.5px solid #a78bfa" : undefined, // Purple border matching the lavender background
					"&:hover": {
						backgroundColor: isActive ? GROUP_COLUMN_BG : undefined,
					},
				}}
			/>
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
							minWidth: "400px",
							maxWidth: "500px",
							padding: 0,
						},
					},
				}}
			>
				<GroupByPanel fields={fields} />
			</ODSPopover>
		</div>
	);
};

export default GroupByButton;
