/**
 * Custom hook for Ranking editor
 * Manages ranking state, validation, and dialog/popover state
 * Inspired by sheets project's useRankingEditor
 */
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { isEmpty } from "lodash";
import type { IRankingCell } from "@/types";
import { validateAndParseRanking } from "../../../renderers/ranking/utils/validateAndParseRanking";

const iconWidth = 20 + 6; // iconWidth (20px) + gap (6px)
const paddingWidth = 8;
const paddingHeight = 4;

interface UseRankingEditorProps {
	initialValue: IRankingCell | null;
	onChange: (value: IRankingCell["data"]) => void;
	rect: { x: number; y: number; width: number; height: number };
}

interface RankingItem {
	id: string;
	rank: number;
	label: string;
}

export function useRankingEditor({
	initialValue,
	onChange,
	rect,
}: UseRankingEditorProps) {
	const { options = [] } = initialValue?.options || {};
	const { parsedValue = [] } = validateAndParseRanking(
		initialValue?.data
			? JSON.stringify(initialValue.data)
			: initialValue?.displayData || "",
		options,
	);

	const newValue = Array.isArray(parsedValue) ? parsedValue : [];

	const [ranking, setRanking] = useState<RankingItem[]>(newValue);
	const [isExpanded, setIsExpanded] = useState<
		"" | "expanded_view" | "open_dialog"
	>("");
	const popoverRef = useRef<HTMLDivElement>(null); // Keep for compatibility, but editor uses expandIconRef

	const { width: containerWidth, height: containerHeight } = rect;

	const availableHeight = +(containerHeight - paddingHeight).toFixed(2);
	const availableWidth = +(
		containerWidth -
		iconWidth -
		paddingWidth -
		2
	).toFixed(2);

	/**
	 * Handle ranking change when user selects a different rank from dropdown
	 * or drags and drops items
	 */
	const handleChange = useCallback(
		(value: RankingItem | null, index: number) => {
			if (!value) return;

			const newRanking = (isEmpty(ranking) ? options : ranking).map(
				(option, idx) => ({
					...option,
					rank: idx + 1, // Ensures ranks start from 1
				}),
			);

			const futureIndex = value.rank - 1; // Convert rank to 0-based index

			// Prevent invalid swaps (e.g., futureIndex out of bounds)
			if (futureIndex < 0 || futureIndex >= newRanking.length) {
				return;
			}

			// Swapping elements correctly
			const updatedRanking = [...newRanking];

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

	const openDialog = useCallback(() => {
		setIsExpanded("open_dialog");
	}, []);

	const handleSave = useCallback(() => {
		onChange(ranking);
		setIsExpanded("");
	}, [ranking, onChange]);

	const closeDialog = useCallback(() => {
		setIsExpanded("");
		// Reset to initial value on cancel
		const { parsedValue: resetValue = [] } = validateAndParseRanking(
			initialValue?.data
				? JSON.stringify(initialValue.data)
				: initialValue?.displayData || "",
			options,
		);
		setRanking(Array.isArray(resetValue) ? resetValue : []);
	}, [initialValue, options]);

	const rankingValues = useMemo(() => {
		return (ranking || []).map((item) => `${item.rank}. ${item.label}`);
	}, [ranking]);

	const isRankingValid = useMemo(
		() => !ranking.some((item) => !item.rank),
		[ranking],
	);

	const handlePopoverClose = useCallback(() => {
		setIsExpanded("");
	}, []);

	const handlePopoverOpen = useCallback(() => {
		setIsExpanded("expanded_view");
	}, []);

	const fieldName = useMemo(() => {
		// Field name should come from cell metadata, not options
		// For now, use a default - this can be extended later if field name is available
		return "Ranking";
	}, []);

	// Open dialog if initialValue is null or undefined (empty ranking)
	// Only open on mount if ranking is empty
	useEffect(() => {
		// Check if ranking is empty (no data or empty array)
		const isEmptyRanking = isEmpty(ranking) || ranking.length === 0;
		if (isEmptyRanking) {
			// Auto-open dialog when ranking is empty (like sheets repo)
			openDialog();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only run on mount

	// Update local state when initialValue changes (but not on mount to avoid overriding auto-open dialog)
	useEffect(() => {
		// Skip if this is the initial mount (to allow auto-open dialog logic)
		let isMounted = false;
		const timer = setTimeout(() => {
			isMounted = true;
		}, 0);

		return () => {
			clearTimeout(timer);
			if (isMounted) {
				if (initialValue?.data) {
					setRanking(initialValue.data);
				} else if (initialValue?.displayData) {
					const { parsedValue: updatedParsedValue } =
						validateAndParseRanking(
							initialValue.displayData,
							options,
						);
					if (updatedParsedValue) {
						setRanking(updatedParsedValue);
					}
				}
			}
		};
	}, [initialValue?.data, initialValue?.displayData, options]);

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
		wrapClass: "", // Can be extended later for wrap mode
		rankingValues,
		isRankingValid,
		handlePopoverClose,
		handlePopoverOpen,
		fieldName,
	};
}
