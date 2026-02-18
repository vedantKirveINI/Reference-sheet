import React from "react";

interface RankingListProps {
	wrapClass?: string;
	visibleRankings: string[];
	limitValue: string;
}

export const RankingList: React.FC<RankingListProps> = ({
	wrapClass = "",
	visibleRankings = [],
	limitValue = "",
}) => {
	return (
		<>
			<div className={`flex items-center gap-2 flex-1 max-w-[calc(100%-28px)] ${wrapClass ? "flex-wrap whitespace-normal" : ""}`}>
				{visibleRankings.map((item, index) => (
					<div
						key={`${item}-${index}`}
						className="px-2 py-0 rounded-md font-[var(--tt-font-family)] text-[var(--cell-font-size)] leading-5 tracking-[0.1px] bg-[#cfd8dc] whitespace-nowrap overflow-hidden text-ellipsis text-[var(--cell-text-primary-color)]"
						title={item}
					>
						{item}
					</div>
				))}

				{limitValue && <div className="px-1 py-0 rounded-md bg-[#cfd8dc] tracking-[0.1px] font-[var(--tt-font-family)] text-[13px] leading-5 text-[var(--cell-text-primary-color)]">...</div>}
			</div>

			{wrapClass !== "wrap" && <div className="w-0.5 bg-transparent inline-block" />}
		</>
	);
};
