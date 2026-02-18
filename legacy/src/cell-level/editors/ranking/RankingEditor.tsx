/**
 * Ranking Cell Editor Component
 *
 * PATTERN REFERENCE: This editor follows the same pattern as SignatureEditor and McqEditor
 * Use this as a reference when creating new cell editors.
 *
 * KEY PATTERNS:
 * 1. SAVING LOGIC: onChange is called ONLY on save events (Enter/Tab/blur), NOT on every change
 *    - Local state updates immediately for UI feedback
 *    - Parent onChange is called only when saving
 *    - This prevents full page re-renders during editing
 *
 * 2. POSITIONING: Matches StringEditor's border alignment
 *    - width: rect.width + 4 (2px border on each side)
 *    - height: rect.height + 4 (2px border on top/bottom)
 *    - marginLeft/Top: -2 (aligns border with cell)
 *
 * 3. KEYBOARD HANDLING:
 *    - Enter: Save and navigate to next cell
 *    - Tab: Save and navigate
 *    - Escape: Cancel editing
 *
 * 4. BLUR HANDLING: Save on blur (focus out), but check if focus is moving within editor
 *
 * 5. EVENT PROPAGATION: Stop propagation to prevent canvas scrolling/interaction
 */
import React, { useRef, useCallback } from "react";
import { isEmpty } from "lodash";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ODSIcon from "@/lib/oute-icon";
import type { IRankingCell } from "@/types";
import { useRankingEditor } from "./hooks/useRankingEditor";
import { useRankingTiles } from "../../renderers/ranking/hooks/useRankingTiles";
import { RankingList } from "./components/RankingList";
import { ExpandedView } from "./components/ExpandedView";
import { Content } from "./components/Content";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

interface RankingEditorProps {
	cell: IRankingCell;
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: IRankingCell["data"]) => void;
	onSave?: () => void;
	onCancel?: () => void;
	onEnterKey?: (shiftKey: boolean) => void;
}

const PADDING_WIDTH = 8;
const PADDING_HEIGHT = 4;

export const RankingEditor: React.FC<RankingEditorProps> = ({
	cell,
	rect,
	theme,
	isEditing,
	onChange,
	onSave,
	onCancel,
	onEnterKey,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const popperRef = useRef<HTMLDivElement>(null);
	const expandIconRef = useRef<HTMLDivElement>(null);

	const initialValue = cell;

	const {
		isExpanded,
		setIsExpanded,
		openDialog,
		closeDialog,
		popoverRef: _popoverRef,
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
	} = useRankingEditor({
		initialValue,
		onChange: (value) => {
			onChange(value);
		},
		rect,
	});

	const { limitValue = "", visibleRankings = [] } = useRankingTiles({
		rankingValues: rankingValues,
		availableWidth,
		availableHeight,
		isWrapped: wrapClass === "wrap",
		fontSize: theme.fontSize,
		fontFamily: theme.fontFamily,
	});

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && isExpanded === "") {
				e.preventDefault();
				e.stopPropagation();
				handleSave();
				onSave?.();
				if (onEnterKey) {
					requestAnimationFrame(() => {
						onEnterKey(e.shiftKey);
					});
				}
			} else if (e.key === "Tab" && isExpanded === "") {
				e.preventDefault();
				e.stopPropagation();
				handleSave();
				onSave?.();
			} else if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				if (isExpanded === "open_dialog") {
					closeDialog();
				} else if (isExpanded === "expanded_view") {
					handlePopoverClose();
				} else {
					onCancel?.();
				}
			}
		},
		[
			handleSave,
			onSave,
			onCancel,
			onEnterKey,
			isExpanded,
			closeDialog,
			handlePopoverClose,
		],
	);

	const handleBlur = useCallback(() => {
		setTimeout(() => {
			const activeElement = document.activeElement;

			const popperElement = containerRef.current?.querySelector(
				"[data-ranking-expanded-popper]",
			);

			const dialogElement = document.querySelector('[role="dialog"]');

			if (
				containerRef.current &&
				(containerRef.current === activeElement ||
					containerRef.current.contains(activeElement) ||
					popperElement?.contains(activeElement) ||
					dialogElement?.contains(activeElement))
			) {
				return;
			}

			if (isExpanded === "") {
				handleSave();
				onSave?.();
			}
		}, 0);
	}, [handleSave, onSave, isExpanded]);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
	}, []);

	const handleKeyDownDialog = useCallback((e: React.KeyboardEvent) => {
		e.stopPropagation();
	}, []);

	const editorStyle: React.CSSProperties = {
		position: "absolute",
		left: `${rect.x}px`,
		top: `${rect.y}px`,
		width: `${rect.width + 4}px`,
		height: `${rect.height + 4}px`,
		marginLeft: -2,
		marginTop: -2,
		zIndex: 1000,
		backgroundColor: theme.cellBackgroundColor,
		border: `2px solid ${theme.cellActiveBorderColor}`,
		borderRadius: "2px",
		padding: `${PADDING_HEIGHT}px ${PADDING_WIDTH}px`,
		boxSizing: "border-box",
		pointerEvents: "auto",
	};

	return (
		<div
			ref={containerRef}
			className="relative box-border outline-none flex flex-col h-full font-[var(--tt-font-family)] text-[var(--cell-font-size)] min-w-[100px]"
			style={editorStyle}
			tabIndex={-1}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown}
			data-testid="ranking-editor"
		>
			{!isEmpty(ranking) && isRankingValid && (
				<div
					className="flex justify-between items-start w-full mt-0.5 box-border"
					data-testid="ranking-editor-list"
				>
					<RankingList
						wrapClass={wrapClass}
						visibleRankings={visibleRankings}
						limitValue={limitValue}
					/>

					<div
						className="cursor-pointer shrink-0"
						onClick={handlePopoverOpen}
						ref={expandIconRef}
						data-testid="ranking-editor-expand-icon"
					>
						<ODSIcon
							outeIconName="OUTEOpenFullscreenIcon"
							outeIconProps={{
								className: "w-5 h-5 bg-[#212121] text-white rounded-sm",
							}}
						/>
					</div>
				</div>
			)}

			{isExpanded === "expanded_view" && expandIconRef.current && (
				<div
					ref={popperRef}
					className="rounded-md border-[0.75px] border-[#cfd8dc] bg-white shadow-[0rem_0.375rem_0.75rem_0rem_rgba(122,124,141,0.2)]"
					data-ranking-expanded-popper
					style={{
						position: "absolute",
						top: "100%",
						left: 0,
						marginTop: "4px",
						zIndex: 1001,
						width: "16.25rem",
					}}
					onClick={(e) => e.stopPropagation()}
					onMouseDown={(e) => {
						e.stopPropagation();
					}}
				>
					<ExpandedView
						ranking={ranking}
						label="EDIT"
						setIsExpanded={setIsExpanded}
						openDialog={openDialog}
						title={fieldName}
					/>
				</div>
			)}

			<Dialog
				open={isExpanded === "open_dialog"}
				onOpenChange={(v) => {
					if (!v) closeDialog();
				}}
			>
				<DialogContent
					className="max-w-[33.625rem] p-0"
					onKeyDown={handleKeyDownDialog}
				>
					<DialogHeader className="px-6 pt-6">
						<DialogTitle asChild>
							<Header title={fieldName} />
						</DialogTitle>
					</DialogHeader>
					<Content
						ranking={ranking}
						setRanking={setRanking}
						handleChange={handleChange}
						options={options}
					/>
					<Footer
						handleClose={closeDialog}
						handleSave={() => {
							handleSave();
							closeDialog();
							onSave?.();
						}}
						disabled={isEmpty(ranking)}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
};
