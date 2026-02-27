import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import isEmpty from "lodash/isEmpty";
import ODSAutocomplete from "oute-ds-autocomplete";
import ODSIcon from "oute-ds-icon";
import ODSTextField from "oute-ds-text-field";
import React from "react";

import styles from "./styles.module.scss";

const SortableItem = ({
	element = {},
	ranking = [],
	options = [],
	handleChange = () => {},
	index = 0, // Pass the index of the element in the ranking array
}) => {
	const { attributes, listeners, setNodeRef, transform } = useSortable({
		id: element.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition: transform ? "transform 150ms ease" : "none",
	};

	const rankingOptions = (isEmpty(ranking) ? options : ranking).map(
		(item, index) => ({
			...item,
			rank: item.rank ?? index + 1,
		}),
	);

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={styles.content}
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
				getOptionLabel={(option) => `${option?.rank}`}
				disableClearable={true}
				value={
					element.rank
						? rankingOptions.find(
								(opt) => opt.rank === element.rank,
							) || null
						: { id: "", rank: "--", label: "" }
				}
				onChange={(event, value) => {
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

export default SortableItem;
