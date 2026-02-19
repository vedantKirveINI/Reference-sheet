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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";
import type { IRankingCell } from "@/types";
import { useRankingEditor } from "./hooks/useRankingEditor";
import { useRankingTiles } from "../../renderers/ranking/hooks/useRankingTiles";
import { RankingList } from "./components/RankingList";
import { ExpandedView } from "./components/ExpandedView";
import { Content } from "./components/Content";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import styles from "./RankingEditor.module.css";

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
        const popperRef = useRef<HTMLDivElement>(null); // Ref for inline popper container
        const expandIconRef = useRef<HTMLDivElement>(null); // Ref for expand icon (anchor for popper)

        const initialValue = cell;

        const {
                isExpanded,
                setIsExpanded,
                openDialog,
                closeDialog,
                popoverRef: _popoverRef, // Unused - we use expandIconRef instead
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

        /**
         * PATTERN: Keyboard event handler (matches StringEditor pattern)
         * - Enter: Save value and navigate to next cell
         * - Tab: Save value and navigate
         * - Escape: Cancel editing (discard changes)
         */
        const handleKeyDown = useCallback(
                (e: React.KeyboardEvent) => {
                        // Don't handle Enter if dialog/popover is open (let user interact)
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

        /**
         * PATTERN: Blur event handler (matches StringEditor pattern)
         * - Checks if focus is moving within editor (don't close if it is)
         * - Saves value when focus moves outside editor
         * - Uses setTimeout to check focus after event propagation
         */
        const handleBlur = useCallback(() => {
                // PATTERN: Use setTimeout to check focus after event propagation
                setTimeout(() => {
                        const activeElement = document.activeElement;

                        // Check for popper element using data attribute (like MCQ editor)
                        const popperElement = containerRef.current?.querySelector(
                                "[data-ranking-expanded-popper]",
                        );

                        // Check if dialog is open (ODSDialog creates a portal)
                        const dialogElement = document.querySelector('[role="dialog"]');

                        if (
                                containerRef.current &&
                                (containerRef.current === activeElement ||
                                        containerRef.current.contains(activeElement) ||
                                        popperElement?.contains(activeElement) ||
                                        dialogElement?.contains(activeElement))
                        ) {
                                // Focus is still within editor, popper, or dialog, don't close
                                return;
                        }

                        // Focus moved outside editor, save and close
                        if (isExpanded === "") {
                                // Only save if no dialog/popover is open
                                handleSave();
                                onSave?.();
                        }
                }, 0);
        }, [handleSave, onSave, isExpanded]);

        // Stop event propagation to prevent canvas scrolling/interaction
        const handleMouseDown = useCallback((e: React.MouseEvent) => {
                e.stopPropagation();
        }, []);

        const handleKeyDownDialog = useCallback((e: React.KeyboardEvent) => {
                e.stopPropagation();
        }, []);

        // Editor positioning and styling (matches StringEditor exactly)
        const editorStyle: React.CSSProperties = {
                position: "absolute",
                left: `${rect.x}px`,
                top: `${rect.y}px`,
                width: `${rect.width + 4}px`, // Add 4px for 2px border on each side
                height: `${rect.height + 4}px`, // Add 4px for 2px border on top/bottom
                marginLeft: -2, // Offset by border width to align with cell
                marginTop: -2, // Offset by border width to align with cell
                zIndex: 1000,
                backgroundColor: theme.cellBackgroundColor,
                border: `2px solid ${theme.cellActiveBorderColor}`,
                borderRadius: "2px",
                padding: `${PADDING_HEIGHT}px ${PADDING_WIDTH}px`,
                boxSizing: "border-box",
                pointerEvents: "auto", // Allow interaction with editor
        };

        return (
                <div
                        ref={containerRef}
                        className={styles.rank_container}
                        style={editorStyle}
                        tabIndex={-1}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        onMouseDown={handleMouseDown}
                        data-testid="ranking-editor"
                >
                        {!isEmpty(ranking) && isRankingValid && (
                                <div
                                        className={styles.rank_list}
                                        data-testid="ranking-editor-list"
                                >
                                        <RankingList
                                                wrapClass={wrapClass}
                                                visibleRankings={visibleRankings}
                                                limitValue={limitValue}
                                        />

                                        <div
                                                className={styles.expand_icon}
                                                onClick={handlePopoverOpen}
                                                ref={expandIconRef}
                                                data-testid="ranking-editor-expand-icon"
                                        >
                                                <Maximize2
                                                        className="text-white"
                                                        style={{
                                                                width: "20px",
                                                                height: "20px",
                                                                backgroundColor: "#212121",
                                                                borderRadius: "2px",
                                                                padding: "2px",
                                                        }}
                                                />
                                        </div>
                                </div>
                        )}

                        {/* Inline popper container for expanded view (like MCQ editor) */}
                        {isExpanded === "expanded_view" && expandIconRef.current && (
                                <div
                                        ref={popperRef}
                                        className={styles.ranking_popper_container}
                                        data-ranking-expanded-popper
                                        style={{
                                                position: "absolute",
                                                top: "100%",
                                                left: 0,
                                                marginTop: "4px",
                                                zIndex: 1001,
                                                width: "16.25rem", // 260px
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

                        {/* Dialog for full ranking editor */}
                        <Dialog
                                open={isExpanded === "open_dialog"}
                                onOpenChange={(open) => { if (!open) closeDialog(); }}
                        >
                                <DialogContent
                                        style={{ maxWidth: "33.625rem" }}
                                        onKeyDown={handleKeyDownDialog}
                                        onInteractOutside={(e) => e.preventDefault()}
                                >
                                        <DialogHeader>
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
                                        <DialogFooter>
                                                <Footer
                                                        handleClose={closeDialog}
                                                        handleSave={() => {
                                                                handleSave();
                                                                closeDialog();
                                                                onSave?.();
                                                        }}
                                                        disabled={isEmpty(ranking)}
                                                />
                                        </DialogFooter>
                                </DialogContent>
                        </Dialog>
                </div>
        );
};
