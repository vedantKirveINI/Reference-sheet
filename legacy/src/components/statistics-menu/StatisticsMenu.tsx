import React, { useMemo, useRef, useEffect } from "react";
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

export const StatisticsMenu: React.FC<IStatisticsMenuProps> = ({
	open,
	anchorPosition,
	onClose,
	columnId,
	currentStatistic,
}) => {
	const { setColumnStatistic } = useStatisticsStore();
	const statistics = useMemo(() => getOrderedStatistics(), []);
	const menuRef = useRef<HTMLDivElement | null>(null);

	const handleSelect = (statisticId: StatisticsFunction) => {
		setColumnStatistic(columnId, statisticId);
		onClose();
	};

	useEffect(() => {
		if (!open) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				onClose();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [open, onClose]);

	if (!open || !anchorPosition) return null;

	return (
		<div
			ref={menuRef}
			className="fixed z-[200] min-w-[180px] max-w-[220px] py-1 bg-[#36393f] border border-[#e5e7eb] rounded-lg shadow-[0px_4px_12px_rgba(0,0,0,0.15)]"
			style={{
				top: anchorPosition.top,
				left: anchorPosition.left,
			}}
		>
			{statistics.map((statistic: IStatisticConfig) => {
				const isSelected = statistic.id === currentStatistic;

				return (
					<button
						key={statistic.id}
						onClick={() => handleSelect(statistic.id)}
						className={`flex items-center w-full py-2 px-4 min-h-[36px] border-none cursor-pointer text-left text-white transition-colors ${isSelected ? "bg-[#4a4d52]" : "bg-transparent hover:bg-[#4a4d52] focus:bg-[#4a4d52]"}`}
					>
						<span
							className={`font-[Inter,sans-serif] text-sm text-white ${isSelected ? "font-medium" : "font-normal"}`}
						>
							{statistic.label}
						</span>
					</button>
				);
			})}
		</div>
	);
};
