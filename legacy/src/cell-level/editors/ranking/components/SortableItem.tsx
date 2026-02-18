import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isEmpty } from "lodash";
import ODSAutocomplete from "oute-ds-autocomplete";
import ODSIcon from "oute-ds-icon";
import ODSTextField from "oute-ds-text-field";
import styles from "./SortableItem.module.css";

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
			className={`${styles.content} ${index === 0 ? styles.first_item : ""}`}
			data-testid={`sortable-ranking-item-${index}`}
		>
			<ODSAutocomplete
				variant="black"
				data-testid={`ods-autocomplete-${element.id}`}
				sx={{
					borderRight: "1px solid #B0BEC5",
					borderRadius: "0",
					width: "17%",
				}}
				hideBorders={true}
				options={rankingOptions}
				getOptionLabel={(option: RankingItem) => `${option?.rank}`}
				disableClearable={true}
				value={
					element.rank
						? rankingOptions.find(
								(opt) => opt.rank === element.rank,
							) || null
						: { id: "", rank: 0, label: "" }
				}
				onChange={(event: unknown, value: RankingItem | null) => {
					handleChange(value, index);
				}}
			/>

			<ODSTextField
				data-testid="ranking-label"
				value={element.label}
				hideBorders={true}
				inputProps={{ readOnly: true }}
				sx={{
					width: "100%",
					"& .MuiOutlinedInput-input": {
						cursor: "auto",
					},
					"& .MuiInputBase-root": {
						paddingLeft: "0rem",
					},
				}}
			/>

			<div {...listeners} {...attributes} style={{ cursor: "grab" }}>
				<ODSIcon
					outeIconName="OUTEDragIcon"
					outeIconProps={{
						sx: {
							color: "#607D8B",
							width: "1.5rem",
							height: "1.5rem",
						},
					}}
				/>
			</div>
		</div>
	);
};
