import React, { useMemo } from "react";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import {
	useStatisticsStore,
	StatisticsFunction,
} from "@/stores/statisticsStore";
import {
	getOrderedStatistics,
	type IStatisticConfig,
} from "./statisticsMenuConfig";

interface IStatisticsMenuProps {
	open: boolean;
	anchorPosition: { top: number; left: number } | undefined;
	onClose: () => void;
	columnId: string;
	currentStatistic: StatisticsFunction;
}

const MENU_STYLES = {
	paper: {
		minWidth: "180px",
		maxWidth: "220px",
		padding: "4px 0",
		boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
		border: "1px solid #e5e7eb",
		borderRadius: "8px",
		backgroundColor: "#36393f",
	},
	menuItem: {
		padding: "8px 16px",
		minHeight: "36px",
		display: "flex",
		alignItems: "center",
		color: "#ffffff",
	},
	text: {
		fontFamily: "Inter, sans-serif",
		fontSize: "14px",
		color: "#ffffff",
	},
	selectedBg: "#4a4d52",
};

export const StatisticsMenu: React.FC<IStatisticsMenuProps> = ({
	open,
	anchorPosition,
	onClose,
	columnId,
	currentStatistic,
}) => {
	const { setColumnStatistic } = useStatisticsStore();
	const statistics = useMemo(() => getOrderedStatistics(), []);

	const handleSelect = (statisticId: StatisticsFunction) => {
		setColumnStatistic(columnId, statisticId);
		onClose();
	};

	if (!open || !anchorPosition) return null;

	return (
		<Popover
			open={open}
			anchorReference="anchorPosition"
			anchorPosition={anchorPosition}
			onClose={onClose}
			anchorOrigin={{ vertical: "top", horizontal: "left" }}
			transformOrigin={{ vertical: "top", horizontal: "left" }}
			slotProps={{ paper: { style: MENU_STYLES.paper } }}
		>
			{statistics.map((statistic: IStatisticConfig) => {
				const isSelected = statistic.id === currentStatistic;

				return (
					<MenuItem
						key={statistic.id}
						onClick={() => handleSelect(statistic.id)}
						sx={{
							...MENU_STYLES.menuItem,
							backgroundColor: isSelected
								? MENU_STYLES.selectedBg
								: "transparent",
							"&:hover": {
								backgroundColor: MENU_STYLES.selectedBg,
							},
							"&:focus": {
								backgroundColor: MENU_STYLES.selectedBg,
							},
						}}
					>
						<ListItemText
							primary={
								<span
									style={{
										...MENU_STYLES.text,
										fontWeight: isSelected ? "500" : "400",
									}}
								>
									{statistic.label}
								</span>
							}
						/>
					</MenuItem>
				);
			})}
		</Popover>
	);
};
