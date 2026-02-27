import isEmpty from "lodash/isEmpty";
import { useState, useCallback } from "react";

import validateAndParseRanking from "../../../../QuestionType/Ranking/utils/validateAndParseRanking";

function useRankingFieldHandler({
	value = "",
	onChange = () => {},
	field = {},
}) {
	const { name: fieldName = "", options: config = {} } = field || {};
	const { options = [] } = config || {};

	const { parsedValue = [], isValid = false } = validateAndParseRanking(
		value,
		options,
	);

	const [showEditor, setShowEditor] = useState(false);
	const [initialValue, setInitialValue] = useState(parsedValue);
	const [ranking, setRanking] = useState(parsedValue);

	const handleClick = useCallback(() => {
		setShowEditor(true);
	}, []);

	const closeDialog = useCallback(() => {
		setShowEditor(false);
		setRanking(initialValue);
	}, [initialValue]);

	const handleChange = useCallback(
		(value, index) => {
			const newRaking = (isEmpty(ranking) ? options : ranking).map(
				(option, index) => ({
					...option,
					rank: index + 1, // Ensures ranks start from 1
				}),
			);

			const futureIndex = value.rank - 1; // Convert rank to 0-based index

			// Prevent invalid swaps (e.g., futureIndex out of bounds)
			if (futureIndex < 0 || futureIndex >= newRaking.length) {
				console.error("Invalid swap attempt!");
				return;
			}

			// Swapping elements correctly
			const updatedRanking = [...newRaking];

			const currentElement = { ...updatedRanking[index] }; // Clone object to avoid mutation
			const futureElement = { ...updatedRanking[futureIndex] };

			// Swap ranks
			currentElement.rank = futureElement.rank;
			futureElement.rank = updatedRanking[index].rank;

			// Swap elements in the array
			updatedRanking[index] = futureElement;
			updatedRanking[futureIndex] = currentElement;

			// Update state
			setRanking(updatedRanking);
		},
		[ranking, options],
	);

	const handleSave = useCallback(() => {
		onChange(JSON.stringify(ranking));
		setInitialValue(ranking);
		setShowEditor(false);
	}, [ranking, onChange]);

	return {
		ranking,
		isValid,
		parsedValue,
		showEditor,
		handleClick,
		closeDialog,
		handleChange,
		handleSave,
		fieldName,
		options,
		setRanking,
		initialValue,
	};
}

export default useRankingFieldHandler;
