import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	SortableContext,
	arrayMove,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { isEmpty } from "lodash";
import { SortableItem } from "./SortableItem";

interface RankingItem {
	id: string;
	rank: number;
	label: string;
}

interface ContentProps {
	ranking: RankingItem[];
	setRanking: React.Dispatch<React.SetStateAction<RankingItem[]>>;
	handleChange: (value: RankingItem | null, index: number) => void;
	options: RankingItem[];
}

const handleDragEnd = ({
	event,
	setRanking,
	options,
}: {
	event: { active: { id: string }; over: { id: string } | null };
	setRanking: React.Dispatch<React.SetStateAction<RankingItem[]>>;
	options: RankingItem[];
}) => {
	const { active, over } = event;

	if (!over || active.id === over.id) return;

	setRanking((prev) => {
		const currentItems = isEmpty(prev) ? options : prev;

		const oldIndex = currentItems.findIndex(
			(item) => item.id === active.id,
		);
		const newIndex = currentItems.findIndex((item) => item.id === over.id);

		if (oldIndex === -1 || newIndex === -1) return prev;

		const newRanking = arrayMove(currentItems, oldIndex, newIndex);

		return newRanking.map((item, index) => ({
			...item,
			rank: index + 1,
		}));
	});
};

export const Content: React.FC<ContentProps> = ({
	ranking = [],
	setRanking,
	handleChange,
	options = [],
}) => {
	const iterableItem = isEmpty(ranking) ? options : ranking;

	return (
		<div className="max-h-[60vh] px-6 py-8 overflow-y-auto overflow-x-visible box-border">
			<span className="text-sm font-normal font-sans text-[#607D8B]">
				Rank by dragging the tile up or down or selecting a number from
				the dropdown.
			</span>

			<div className="py-3 overflow-visible mt-3">
				<DndContext
					collisionDetection={closestCenter}
					onDragEnd={(event) =>
						handleDragEnd({ event, setRanking, options })
					}
					modifiers={[restrictToVerticalAxis]}
				>
					<SortableContext
						items={iterableItem.map((item) => item.id)}
						strategy={verticalListSortingStrategy}
					>
						{iterableItem.map((element, index) => (
							<SortableItem
								key={element.id}
								element={element}
								ranking={ranking}
								handleChange={handleChange}
								index={index}
								options={options}
							/>
						))}
					</SortableContext>
				</DndContext>
			</div>
		</div>
	);
};
