import isEmpty from "lodash/isEmpty";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";

import validateAndParseRanking from "../utils/validateAndParseRanking";

const iconWidth = 20 + 6; // iconWidth + gap
const paddingWidth = 8;
const paddingHeight = 4;

function useRankingEditor(props) {
	const {
		onChange = () => {},
		setShow = () => {},
		close = () => {},
		editorDimension = {},
		initialValue = "",
		cellProperties = {},
	} = props || {};

	const { fieldInfo = {}, wrapClass = "" } =
		cellProperties?.cellProperties || {};

	const { options: config = {}, name: fieldName = "" } = fieldInfo || {};

	const { options = [] } = config || {};
	const { parsedValue = [] } = validateAndParseRanking(initialValue, options);

	const newValue = Array.isArray(parsedValue) ? parsedValue : [];

	const [ranking, setRanking] = useState(newValue);
	const [isExpanded, setIsExpanded] = useState("");
	const popoverRef = useRef();

	const { width: containerWidth, height: containerHeight } =
		editorDimension || {};

	const availableHeight = +(containerHeight - paddingHeight).toFixed(2);
	const availableWidth = +(
		containerWidth -
		iconWidth -
		paddingWidth -
		2
	).toFixed(2);

	const handleChange = (value, index) => {
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
	};

	const openDialog = () => {
		setIsExpanded(() => "open_dialog");
		setShow(true);
	};

	const handleSave = () => {
		onChange(JSON.stringify(ranking));
		setIsExpanded("");
		setShow(false);
		close();
	};

	const closeDialog = () => {
		setIsExpanded("");
		setShow(false);
		close();
	};

	const rankingValues = useMemo(() => {
		return (ranking || []).map((item) => `${item.rank}. ${item.label}`);
	}, [ranking]);

	const isRankingValid = useMemo(
		() => !ranking.some((item) => !item.rank),
		[ranking],
	);

	const handlePopoverClose = useCallback(() => {
		setIsExpanded(() => "");
	}, []);

	const handlePopoverOpen = useCallback(() => {
		setIsExpanded(() => "expanded_view");
	}, []);

	useEffect(() => {
		// Open the dialog if initialValue is null or undefined
		if (isEmpty(ranking)) {
			openDialog();
		}
	}, []);

	return {
		isExpanded,
		setIsExpanded,
		openDialog,
		closeDialog,
		popoverRef,
		availableHeight,
		availableWidth,
		ranking,
		setRanking,
		handleChange,
		handleSave,
		options,
		wrapClass,
		rankingValues,
		isRankingValid,
		handlePopoverClose,
		handlePopoverOpen,
		fieldName,
	};
}

export default useRankingEditor;
