import React, {
	useState,
	useCallback,
	useMemo,
	useEffect,
	useRef,
} from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { IRankingCell } from "@/types";
import ODSDialog from "oute-ds-dialog";
import ODSLabel from "oute-ds-label";
import { isEmpty } from "lodash";
import { validateAndParseRanking } from "@/cell-level/renderers/ranking/utils/validateAndParseRanking";
import { Content } from "@/cell-level/editors/ranking/components/Content";
import { Header } from "@/cell-level/editors/ranking/components/Header";
import { Footer } from "@/cell-level/editors/ranking/components/Footer";
import styles from "./RankingFieldEditor.module.scss";

interface RankingItem {
	id: string;
	rank: number;
	label: string;
}

export const RankingFieldEditor: React.FC<IFieldEditorProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	const [showEditor, setShowEditor] = useState(false);
	const rankingCell = cell as IRankingCell | undefined;

	const options = useMemo<RankingItem[]>(() => {
		let rawOptions: Array<{ id: string; label: string }> = [];

		// First try from cell (most reliable)
		if (rankingCell?.options?.options) {
			rawOptions = rankingCell.options.options;
		}

		// Convert to RankingItem format with rank: 0 (will be assigned when ranking starts)
		return rawOptions.map((opt) => ({
			id: opt.id,
			label: opt.label,
			rank: 0, // Initial rank, will be updated when user starts ranking
		}));
	}, [field.options, rankingCell]);

	// Convert value to string format for validation
	const valueString = useMemo(() => {
		if (!value) return "";
		if (typeof value === "string") return value;
		if (typeof value === "object" && value !== null) {
			return JSON.stringify(value);
		}
		return "";
	}, [value]);

	// Parse and validate ranking
	const { isValid = false, parsedValue = undefined } = useMemo(() => {
		return validateAndParseRanking(valueString, options);
	}, [valueString, options]);

	// Use parsedValue as initialValue, or empty array if invalid
	const initialValue = useMemo(() => {
		return parsedValue || [];
	}, [parsedValue]);

	// Local ranking state for dialog editing
	const [ranking, setRanking] = useState<RankingItem[]>(initialValue);
	// Track the last value we saved to prevent resetting when our own save triggers value change
	const lastSavedValueRef = useRef<string>("");

	// Sync ranking state when initialValue changes (when record changes externally)
	// But don't reset if the change came from our own save
	useEffect(() => {
		const currentValueString = JSON.stringify(initialValue);
		// Only sync if the value changed from an external source (not from our save)
		if (currentValueString !== lastSavedValueRef.current) {
			setRanking(initialValue);
		}
	}, [initialValue]);

	// Handle click to open editor
	const handleClick = useCallback(() => {
		if (readonly) return;
		setShowEditor(true);
	}, [readonly]);

	// Handle closing dialog - reset to initial value
	const closeDialog = useCallback(() => {
		setShowEditor(false);
		setRanking(initialValue);
	}, [initialValue]);

	// Handle ranking change in dialog (when user drags or selects rank)
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

			// Prevent invalid swaps
			if (futureIndex < 0 || futureIndex >= newRanking.length) {
				return;
			}

			// Swapping elements correctly
			const updatedRanking = [...newRanking];
			const currentElement = { ...updatedRanking[index] };
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

	// Handle save - pass ranking array directly (matches IRankingCell.data type)
	// If ranking is empty but options exist, save options with ranks based on current order
	const handleSave = useCallback(() => {
		// If ranking is empty, use options with ranks assigned (1, 2, 3, ...)
		// This happens when user opens dialog but doesn't drag items
		const rankingToSave = isEmpty(ranking)
			? options.map((opt, idx) => ({
					...opt,
					rank: idx + 1,
				}))
			: ranking;

		// Track what we're saving to prevent reset when value prop updates
		lastSavedValueRef.current = JSON.stringify(rankingToSave);

		onChange(rankingToSave);
		setShowEditor(false);
	}, [ranking, options, onChange]);

	return (
		<>
			<div
				className={styles.ranking_container}
				onClick={handleClick}
				style={{
					padding: isEmpty(initialValue)
						? "0rem 0.625rem"
						: "0.625rem",
					cursor: readonly ? "not-allowed" : "pointer",
				}}
				data-testid="ranking-expanded-row"
			>
				{isEmpty(initialValue) || !isValid ? (
					<ODSLabel
						variant="subtitle1"
						sx={{
							fontFamily: "Inter",
						}}
						color="#CFD8DC"
					>
						Click to select a ranking
					</ODSLabel>
				) : (
					initialValue.map((item, index) => (
						<div
							key={`${item?.id}`}
							className={styles.rank_item}
							title={item?.label || ""}
							data-testid={`ranking-expanded-row-item-${index}`}
						>
							{`${item?.rank}. ${item?.label}`}
						</div>
					))
				)}
			</div>

			{showEditor && (
				<ODSDialog
					open={showEditor}
					showFullscreenIcon={false}
					onClose={closeDialog}
					dialogWidth="33.625rem"
					dialogHeight="auto"
					draggable={false}
					hideBackdrop={false}
					removeContentPadding
					dialogTitle={<Header title={field.name || ""} />}
					dialogContent={
						<Content
							ranking={ranking}
							setRanking={setRanking}
							handleChange={handleChange}
							options={options}
						/>
					}
					dialogActions={
						<Footer
							handleClose={closeDialog}
							handleSave={handleSave}
							disabled={isEmpty(ranking)}
						/>
					}
					onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
				/>
			)}
		</>
	);
};
