import React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/oute-icon";
import ODSIcon from "@/lib/oute-icon";
import { RANKING_ICON } from "@/constants/Icons/questionTypeIcons";

interface RankingItem {
	id: string;
	rank: number;
	label: string;
}

interface ExpandedViewProps {
	ranking: RankingItem[];
	variant?: "black" | "black-outlined";
	label?: string;
	setIsExpanded: (value: "" | "expanded_view" | "open_dialog") => void;
	openDialog: () => void;
	title?: string;
}

export const ExpandedView: React.FC<ExpandedViewProps> = ({
	ranking = [],
	variant = "black",
	label = "EDIT",
	setIsExpanded,
	openDialog,
	title = "",
}) => {
	return (
		<div className="flex flex-col gap-6 p-5">
			<div className="flex items-center justify-between">
				<div
					className="flex items-center gap-[0.375rem]"
					data-testid="popover-ranking-header"
				>
					<Icon
						imageProps={{
							src: RANKING_ICON,
							className: "w-5 h-5",
						}}
					/>
					<span className="text-sm font-normal font-sans">
						{title}
					</span>
				</div>

				<ODSIcon
					outeIconName="OUTECloseIcon"
					onClick={() => setIsExpanded("")}
					outeIconProps={{
						className: "cursor-pointer",
					}}
					buttonProps={{
						className: "p-0",
					}}
				/>
			</div>

			<div className="pr-[0.625rem] max-h-[40vh] overflow-y-auto" data-testid="ranking-list">
				{ranking.map((element) => {
					return (
						<div
							key={element.id}
							className="px-2 py-1 rounded-md bg-[#cfd8dc] mb-3 overflow-hidden text-ellipsis whitespace-nowrap"
							data-testid={`ranking-item-${element.rank}`}
						>
							<span className="text-sm">{`${element.rank}. ${element.label}`}</span>
						</div>
					);
				})}
			</div>

			<Button
				variant={variant === "black" ? "default" : "outline"}
				onClick={openDialog}
			>
				<ODSIcon
					outeIconName="OUTEEditIcon"
					outeIconProps={{
						className: "text-white",
					}}
				/>
				{label}
			</Button>
		</div>
	);
};
