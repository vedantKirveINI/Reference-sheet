import React, {
	useState,
	useCallback,
	useMemo,
	useEffect,
	useRef,
} from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { IRankingCell } from "@/types";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { isEmpty } from "lodash";
import { validateAndParseRanking } from "@/cell-level/renderers/ranking/utils/validateAndParseRanking";
import { Content } from "@/cell-level/editors/ranking/components/Content";
import { Header } from "@/cell-level/editors/ranking/components/Header";
import { Footer } from "@/cell-level/editors/ranking/components/Footer";

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

		if (rankingCell?.options?.options) {
			rawOptions = rankingCell.options.options;
		}

		return rawOptions.map((opt) => ({
			id: opt.id,
			label: opt.label,
			rank: 0,
		}));
	}, [field.options, rankingCell]);

	const valueString = useMemo(() => {
		if (!value) return "";
		if (typeof value === "string") return value;
		if (typeof value === "object" && value !== null) {
			return JSON.stringify(value);
		}
		return "";
	}, [value]);

	const { isValid = false, parsedValue = undefined } = useMemo(() => {
		return validateAndParseRanking(valueString, options);
	}, [valueString, options]);

	const initialValue = useMemo(() => {
		return parsedValue || [];
	}, [parsedValue]);

	const [ranking, setRanking] = useState<RankingItem[]>(initialValue);
	const lastSavedValueRef = useRef<string>("");

	useEffect(() => {
		const currentValueString = JSON.stringify(initialValue);
		if (currentValueString !== lastSavedValueRef.current) {
			setRanking(initialValue);
		}
	}, [initialValue]);

	const handleClick = useCallback(() => {
		if (readonly) return;
		setShowEditor(true);
	}, [readonly]);

	const closeDialog = useCallback(() => {
		setShowEditor(false);
		setRanking(initialValue);
	}, [initialValue]);

	const handleChange = useCallback(
		(value: RankingItem | null, index: number) => {
			if (!value) return;

			const newRanking = (isEmpty(ranking) ? options : ranking).map(
				(option, idx) => ({
					...option,
					rank: idx + 1,
				}),
			);

			const futureIndex = value.rank - 1;

			if (futureIndex < 0 || futureIndex >= newRanking.length) {
				return;
			}

			const updatedRanking = [...newRanking];
			const currentElement = { ...updatedRanking[index] };
			const futureElement = { ...updatedRanking[futureIndex] };

			currentElement.rank = futureElement.rank;
			futureElement.rank = updatedRanking[index].rank;

			updatedRanking[index] = futureElement;
			updatedRanking[futureIndex] = currentElement;

			setRanking(updatedRanking);
		},
		[ranking, options],
	);

	const handleSave = useCallback(() => {
		const rankingToSave = isEmpty(ranking)
			? options.map((opt, idx) => ({
					...opt,
					rank: idx + 1,
				}))
			: ranking;

		lastSavedValueRef.current = JSON.stringify(rankingToSave);

		onChange(rankingToSave);
		setShowEditor(false);
	}, [ranking, options, onChange]);

	return (
		<>
			<div
				className={`flex min-h-[2.5rem] items-center flex-wrap gap-2.5 rounded-md border border-[#cfd8dc] w-full ${isEmpty(initialValue) ? "px-2.5 py-0" : "p-2.5"} ${readonly ? "cursor-not-allowed" : "cursor-pointer"}`}
				onClick={handleClick}
				data-testid="ranking-expanded-row"
			>
				{isEmpty(initialValue) || !isValid ? (
					<span className="text-sm font-[Inter] text-[#CFD8DC]">
						Click to select a ranking
					</span>
				) : (
					initialValue.map((item, index) => (
						<div
							key={`${item?.id}`}
							className="py-0.5 px-2 rounded-md bg-[#cfd8dc] tracking-[0.0625rem] font-[var(--tt-font-family,sans-serif)] text-[var(--cell-font-size,0.8125rem)] leading-[1.375rem] text-[var(--cell-text-primary-color,#212121)]"
							title={item?.label || ""}
							data-testid={`ranking-expanded-row-item-${index}`}
						>
							{`${item?.rank}. ${item?.label}`}
						</div>
					))
				)}
			</div>

			{showEditor && (
				<Dialog open={showEditor} onOpenChange={(v) => !v && closeDialog()}>
					<DialogContent className="max-w-[33.625rem] p-0" onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}>
						<DialogHeader className="p-4 pb-0">
							<DialogTitle asChild>
								<Header title={field.name || ""} />
							</DialogTitle>
						</DialogHeader>
						<div className="p-0">
							<Content
								ranking={ranking}
								setRanking={setRanking}
								handleChange={handleChange}
								options={options}
							/>
						</div>
						<DialogFooter className="p-4 pt-0">
							<Footer
								handleClose={closeDialog}
								handleSave={handleSave}
								disabled={isEmpty(ranking)}
							/>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};
