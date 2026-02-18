import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isEmpty } from "lodash";
import ODSIcon from "@/lib/oute-icon";

interface RankingItem {
	id: string;
	rank: number;
	label: string;
}

interface SortableItemProps {
	element: RankingItem;
	ranking: RankingItem[];
	options: RankingItem[];
	handleChange: (value: RankingItem | null, index: number) => void;
	index: number;
}

export const SortableItem: React.FC<SortableItemProps> = ({
	element = {} as RankingItem,
	ranking = [],
	options = [],
	handleChange = () => {},
	index = 0,
}) => {
	const { attributes, listeners, setNodeRef, transform } = useSortable({
		id: element.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition: transform ? "transform 150ms ease" : "none",
	};

	const rankingOptions = (isEmpty(ranking) ? options : ranking).map(
		(item, idx) => ({
			...item,
			rank: item.rank ?? idx + 1,
		}),
	);

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex items-center min-h-[2.5rem] p-2 gap-2 rounded-md border border-[#cfd8dc] box-border overflow-visible relative bg-white ${index === 0 ? "!mt-0" : "mt-5"}`}
			data-testid={`sortable-ranking-item-${index}`}
		>
			<select
				data-testid={`ods-autocomplete-${element.id}`}
				className="border-r border-[#B0BEC5] rounded-none w-[17%] bg-transparent border-t-0 border-b-0 border-l-0 outline-none py-1 px-2 text-sm"
				value={element.rank || ""}
				onChange={(e) => {
					const selectedRank = Number(e.target.value);
					const selectedOption = rankingOptions.find(
						(opt) => opt.rank === selectedRank,
					);
					handleChange(selectedOption || null, index);
				}}
			>
				{rankingOptions.map((opt) => (
					<option key={opt.id} value={opt.rank}>
						{opt.rank}
					</option>
				))}
			</select>

			<input
				data-testid="ranking-label"
				value={element.label}
				readOnly
				className="flex-1 border-none outline-none bg-transparent cursor-auto pl-0 text-sm"
			/>

			<div {...listeners} {...attributes} className="cursor-grab">
				<ODSIcon
					outeIconName="OUTEDragIcon"
					outeIconProps={{
						className: "text-[#607D8B] w-6 h-6",
					}}
				/>
			</div>
		</div>
	);
};
