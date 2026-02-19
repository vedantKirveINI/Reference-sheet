import React, { useMemo } from "react";
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
		display: "flex" as const,
		alignItems: "center" as const,
		color: "#ffffff",
		cursor: "pointer" as const,
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
		<>
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					zIndex: 999,
				}}
				onClick={onClose}
			/>
			<div
				style={{
					position: "fixed",
					top: anchorPosition.top,
					left: anchorPosition.left,
					zIndex: 1000,
					...MENU_STYLES.paper,
				}}
			>
				{statistics.map((statistic: IStatisticConfig) => {
					const isSelected = statistic.id === currentStatistic;

					return (
						<div
							key={statistic.id}
							onClick={() => handleSelect(statistic.id)}
							style={{
								...MENU_STYLES.menuItem,
								backgroundColor: isSelected
									? MENU_STYLES.selectedBg
									: "transparent",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = MENU_STYLES.selectedBg;
							}}
							onMouseLeave={(e) => {
								if (!isSelected) {
									e.currentTarget.style.backgroundColor = "transparent";
								}
							}}
						>
							<span
								style={{
									...MENU_STYLES.text,
									fontWeight: isSelected ? "500" : "400",
								}}
							>
								{statistic.label}
							</span>
						</div>
					);
				})}
			</div>
		</>
	);
};
