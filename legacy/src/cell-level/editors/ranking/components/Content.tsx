import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	SortableContext,
	arrayMove,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { isEmpty } from "lodash";
import ODSLabel from "oute-ds-label";
import { SortableItem } from "./SortableItem";
import styles from "./Content.module.css";

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
		// Use options as the base to handle drag and drop when ranking is empty
		const currentItems = isEmpty(prev) ? options : prev;

		const oldIndex = currentItems.findIndex(
			(item) => item.id === active.id,
		);
		const newIndex = currentItems.findIndex((item) => item.id === over.id);

		if (oldIndex === -1 || newIndex === -1) return prev;

		// Move the dragged item in the array
		const newRanking = arrayMove(currentItems, oldIndex, newIndex);

		// Renumber all ranks from 1 to N
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
		<div className={styles.content_container}>
			<ODSLabel
				variant="subtitle1"
				sx={{ fontFamily: "Inter", fontWeight: "400" }}
				color={"#607D8B"}
			>
				Rank by dragging the tile up or down or selecting a number from
				the dropdown.
			</ODSLabel>

			<div className={styles.sortable_list_container}>
				<DndContext
					collisionDetection={closestCenter}
					onDragEnd={(event) =>
						handleDragEnd({ event, setRanking, options })
					}
					modifiers={[restrictToVerticalAxis]} // Restrict dragging to vertical movement
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
