/**
 * Signature Cell Editor Component
 *
 * PATTERN REFERENCE: This editor follows the same pattern as StringEditor and McqEditor
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
import React, { useRef, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Maximize2, X } from "lucide-react";
import type { ISignatureCell } from "@/types";
import Content from "./components/Content";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { useSignatureEditor } from "./hooks/useSignatureEditor";
import { SIGNATURE_ICON } from "@/constants/Icons/questionTypeIcons";
import styles from "./SignatureEditor.module.css";

interface SignatureEditorProps {
        cell: ISignatureCell;
        rect: { x: number; y: number; width: number; height: number };
        theme: any;
        isEditing: boolean;
        onChange: (value: string | null) => void;
        onSave?: () => void;
        onCancel?: () => void;
        onEnterKey?: (shiftKey: boolean) => void;
}

const PADDING_WIDTH = 8;
const PADDING_HEIGHT = 4;

// Constants for signature image sizing (matching renderer)
const SIGNATURE_MIN_WIDTH = 80; // Minimum width for signature image
const SIGNATURE_MIN_HEIGHT = 24; // Minimum height for signature image
const SIGNATURE_ASPECT_RATIO = 80 / 24; // Width:Height ratio (80px:24px = 3.33:1)
const SIGNATURE_PADDING = 4; // Padding around signature image (matching renderer)

// Editor-specific padding values
const INPUT_CONTAINER_PADDING_X = 6.88; // Horizontal padding in signature_input_container
const INPUT_CONTAINER_PADDING_Y = 3; // Vertical padding in signature_input_container
const ACTION_CONTAINER_GAP = 10; // Gap between action icons
const ACTION_ICON_SIZE = 20; // Size of each action icon (1.25rem = 20px)
const ACTION_CONTAINER_WIDTH = ACTION_ICON_SIZE * 2 + ACTION_CONTAINER_GAP; // Width for both icons + gap

export const SignatureEditor: React.FC<SignatureEditorProps> = ({
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
        const popoverRef = useRef<HTMLDivElement>(null);

        const initialValue = cell?.data || cell?.displayData || null;

        const {
                signatureImage,
                signatureRef,
                isExpanded,
                handleSignatureChange,
                setIsExpanded,
                onSave: handleSave,
                loading,
                openDialog,
                closeDialog,
                currentImageUrl,
                imageLoading,
                handleImageLoad,
                handleImageError,
        } = useSignatureEditor({
                initialValue: initialValue || "",
                onChange: (value) => {
                        onChange(value);
                },
                close: () => {
                        onSave?.();
                },
        });

        // Use currentImageUrl for display (updates immediately after upload)
        const displayImageUrl = currentImageUrl || initialValue;

        /**
         * Calculate signature image size dynamically based on available editor space
         * Uses the same logic as SignatureRenderer to ensure consistency
         */
        const signatureImageSize = useMemo(() => {
                // Calculate available dimensions
                // Available width = cell width - editor padding - input container padding - action container (if signature exists)
                const availableWidth =
                        rect.width -
                        PADDING_WIDTH * 2 - // Editor horizontal padding (left + right)
                        INPUT_CONTAINER_PADDING_X * 2 - // Input container horizontal padding (left + right)
                        (displayImageUrl ? ACTION_CONTAINER_WIDTH : 0) - // Action container width if signature exists
                        SIGNATURE_PADDING * 2; // Signature image padding (left + right)

                // Available height = cell height - editor padding - input container padding
                const availableHeight =
                        rect.height -
                        PADDING_HEIGHT * 2 - // Editor vertical padding (top + bottom)
                        INPUT_CONTAINER_PADDING_Y * 2 - // Input container vertical padding (top + bottom)
                        SIGNATURE_PADDING * 2; // Signature image padding (top + bottom)

                // Calculate image dimensions dynamically based on available space
                // Try to use as much space as possible while maintaining aspect ratio
                // Calculate based on width constraint
                let imgWidthByWidth = Math.min(
                        availableWidth,
                        availableHeight * SIGNATURE_ASPECT_RATIO,
                );
                let imgHeightByWidth = imgWidthByWidth / SIGNATURE_ASPECT_RATIO;

                // Calculate based on height constraint
                let imgHeightByHeight = Math.min(
                        availableHeight,
                        availableWidth / SIGNATURE_ASPECT_RATIO,
                );
                let imgWidthByHeight = imgHeightByHeight * SIGNATURE_ASPECT_RATIO;

                // Choose the dimensions that fit best (use the larger size that fits)
                let imgWidth: number;
                let imgHeight: number;

                if (
                        imgWidthByWidth <= availableWidth &&
                        imgHeightByWidth <= availableHeight
                ) {
                        // Width-based calculation fits
                        imgWidth = imgWidthByWidth;
                        imgHeight = imgHeightByWidth;
                } else {
                        // Use height-based calculation
                        imgWidth = imgWidthByHeight;
                        imgHeight = imgHeightByHeight;
                }

                // Ensure minimum dimensions are respected
                imgWidth = Math.max(SIGNATURE_MIN_WIDTH, imgWidth);
                imgHeight = Math.max(SIGNATURE_MIN_HEIGHT, imgHeight);

                // If after applying minimums we exceed available space, scale down proportionally
                if (imgWidth > availableWidth || imgHeight > availableHeight) {
                        const widthScale = availableWidth / imgWidth;
                        const heightScale = availableHeight / imgHeight;
                        const scale = Math.min(widthScale, heightScale);
                        imgWidth = imgWidth * scale;
                        imgHeight = imgHeight * scale;
                        // Re-apply minimums after scaling (might exceed available space slightly, but that's okay)
                        imgWidth = Math.max(SIGNATURE_MIN_WIDTH, imgWidth);
                        imgHeight = Math.max(SIGNATURE_MIN_HEIGHT, imgHeight);
                }

                return {
                        width: Math.round(imgWidth),
                        height: Math.round(imgHeight),
                };
        }, [rect.width, rect.height, displayImageUrl]);

        /**
         * PATTERN: Keyboard event handler (matches StringEditor pattern)
         * - Enter: Save value and navigate to next cell
         * - Tab: Save value and navigate
         * - Escape: Cancel editing (discard changes)
         *
         * NOTE: onChange is called here (on save), NOT on every change
         * This matches StringEditor's pattern of calling onChange only on save events
         */
        const handleKeyDown = useCallback(
                (e: React.KeyboardEvent) => {
                        // Don't handle Enter if dialog is open (let user interact with dialog)
                        if (e.key === "Enter" && isExpanded !== "open_dialog") {
                                e.preventDefault();
                                e.stopPropagation();
                                // PATTERN: Save value before closing (matches StringEditor)
                                onChange(initialValue);
                                onSave?.();
                                // Trigger navigation if onEnterKey is provided
                                if (onEnterKey) {
                                        requestAnimationFrame(() => {
                                                onEnterKey(e.shiftKey);
                                        });
                                }
                        } else if (e.key === "Tab") {
                                e.preventDefault();
                                e.stopPropagation();
                                // PATTERN: Save value before closing (matches StringEditor)
                                onChange(initialValue);
                                onSave?.();
                                // Tab navigation would be handled by keyboard hook
                        } else if (e.key === "Escape") {
                                e.preventDefault();
                                e.stopPropagation();
                                // Close dialog if open, otherwise cancel editing
                                if (isExpanded === "open_dialog") {
                                        closeDialog();
                                } else {
                                        onCancel?.();
                                }
                        }
                },
                [
                        isExpanded,
                        onSave,
                        onCancel,
                        onEnterKey,
                        onChange,
                        initialValue,
                        closeDialog,
                ],
        );

        /**
         * PATTERN: Blur event handler (matches StringEditor pattern)
         * - Checks if focus is moving within editor (don't close if it is)
         * - Saves value when focus moves outside editor
         * - Uses setTimeout to check focus after event propagation (like StringEditor)
         */
        const handleBlur = useCallback(() => {
                // PATTERN: Use setTimeout to check focus after event propagation
                // This prevents blur when clicking inside editor or scrolling (matches StringEditor)
                setTimeout(() => {
                        // If dialog or expanded view is open, don't close the editor
                        if (
                                isExpanded === "open_dialog" ||
                                isExpanded === "expanded_view"
                        ) {
                                return;
                        }

                        const activeElement = document.activeElement;

                        // Check for expanded view popper element
                        const expandedViewElement = document.querySelector(
                                "[data-signature-expanded-view]",
                        );

                        // Check if dialog is open
                        const dialogElement = document.querySelector(
                                "[data-signature-dialog]",
                        );

                        if (
                                containerRef.current &&
                                (containerRef.current === activeElement ||
                                        containerRef.current.contains(activeElement) ||
                                        dialogElement?.contains(activeElement) ||
                                        expandedViewElement?.contains(activeElement))
                        ) {
                                // Focus is still within editor, dialog, or expanded view, don't blur
                                return;
                        }

                        // Focus moved outside, save and close (matches StringEditor pattern)
                        onChange(initialValue);
                        onSave?.();
                }, 100); // Increased delay to allow dialog to fully open
        }, [onSave, onChange, initialValue, isExpanded]);

        /**
         * PATTERN: Prevent blur during mouse interactions (matches StringEditor)
         * Stops event propagation to prevent canvas from handling the event
         */
        const handleMouseDown = useCallback((e: React.MouseEvent) => {
                e.stopPropagation(); // Prevent event bubbling to grid (like StringEditor)
                // Don't preventDefault - allow normal interactions within editor
        }, []);

        /**
         * Handle opening dialog - used by both edit button in editor and edit button in expanded view
         * Closes the expanded view (if open) and opens the dialog
         */
        const handleOpenDialog = useCallback(
                (e?: React.MouseEvent | any) => {
                        // Prevent event propagation to avoid triggering blur
                        if (e) {
                                e.stopPropagation();
                                // Don't preventDefault - we want normal click behavior
                        }

                        // Always call openDialog() - it will set isExpanded to "open_dialog"
                        // This will automatically close the expanded view if it's open
                        // The blur handler will check isExpanded state to prevent closing
                        openDialog();
                },
                [openDialog],
        );

        /**
         * Handle mouse down on edit button to prevent blur
         */
        const handleEditButtonMouseDown = useCallback((e: React.MouseEvent) => {
                e.stopPropagation();
                // Don't preventDefault - we want the click to fire normally
        }, []);

        /**
         * PATTERN: Editor positioning and styling (matches StringEditor exactly)
         * - width + 4: Adds 4px for 2px border on each side
         * - height + 4: Adds 4px for 2px border on top/bottom
         * - marginLeft/Top -2: Offsets by border width to align border with cell
         * This ensures perfect alignment with the cell renderer
         */
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
                <>
                        <div
                                ref={containerRef}
                                className={styles.signature_container}
                                style={editorStyle}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                                onMouseDown={handleMouseDown}
                                tabIndex={-1}
                                data-testid="signature-editor"
                        >
                                <div
                                        className={styles.signature_input_container}
                                        style={{
                                                justifyContent: displayImageUrl
                                                        ? "space-between"
                                                        : "flex-end",
                                        }}
                                >
                                        {displayImageUrl && (
                                                <div
                                                        style={{
                                                                position: "relative",
                                                                width: `${signatureImageSize.width}px`,
                                                                height: `${signatureImageSize.height}px`,
                                                        }}
                                                >
                                                        {imageLoading && (
                                                                <div
                                                                        style={{
                                                                                position: "absolute",
                                                                                top: 0,
                                                                                left: 0,
                                                                                width: "100%",
                                                                                height: "100%",
                                                                                zIndex: 1,
                                                                        }}
                                                                >
                                                                        <Skeleton
                                                                                className="rounded-md"
                                                                                style={{
                                                                                        width: `${signatureImageSize.width}px`,
                                                                                        height: `${signatureImageSize.height}px`,
                                                                                        background:
                                                                                                "linear-gradient(270deg, #F7F8F9 0%, #DDE5EA 50.67%, #F7F8F9 100%)",
                                                                                }}
                                                                        />
                                                                </div>
                                                        )}
                                                        <img
                                                                src={displayImageUrl}
                                                                alt="Signature"
                                                                style={{
                                                                        width: `${signatureImageSize.width}px`,
                                                                        height: `${signatureImageSize.height}px`,
                                                                        objectFit: "contain",
                                                                        opacity: imageLoading ? 0 : 1,
                                                                        transition: "opacity 0.2s",
                                                                }}
                                                                onLoad={handleImageLoad}
                                                                onError={handleImageError}
                                                        />
                                                </div>
                                        )}
                                        <div className={styles.action_container}>
                                                <div
                                                        onMouseDown={handleEditButtonMouseDown}
                                                        onClick={handleOpenDialog}
                                                        data-testid="signature-edit-icon"
                                                        className={styles.edit_action_icon}
                                                        style={{ cursor: "pointer" }}
                                                >
                                                        <Pencil
                                                                className="pointer-events-none"
                                                                style={{
                                                                        backgroundColor: "#21212133",
                                                                        color: "#212121",
                                                                        borderRadius: "0.125rem",
                                                                        width: "1.25rem",
                                                                        height: "1.25rem",
                                                                        padding: "2px",
                                                                }}
                                                        />
                                                </div>

                                                {displayImageUrl && (
                                                        <div
                                                                ref={popoverRef}
                                                                data-testid="signature-expand-icon"
                                                                onClick={() => setIsExpanded("expanded_view")}
                                                                className={styles.expand_action_icon}
                                                                style={{ cursor: "pointer" }}
                                                        >
                                                                <Maximize2
                                                                        className="pointer-events-none"
                                                                        style={{
                                                                                color: "#fff",
                                                                                backgroundColor: "#212121",
                                                                                borderRadius: "0.125rem",
                                                                                width: "1.25rem",
                                                                                height: "1.25rem",
                                                                                padding: "2px",
                                                                        }}
                                                                />
                                                        </div>
                                                )}
                                        </div>
                                </div>

                                {isExpanded === "expanded_view" && (
                                        <div
                                                className={styles.signature_popper_container}
                                                style={{
                                                        position: "absolute",
                                                        top: "100%",
                                                        left: 0,
                                                        marginTop: "4px",
                                                        zIndex: 1001,
                                                        width: `${rect.width}px`,
                                                }}
                                                data-signature-expanded-view
                                        >
                                                <div className={styles.expanded_view_container}>
                                                        <div className={styles.title_container}>
                                                                <div className={styles.title}>
                                                                        <img
                                                                                src={SIGNATURE_ICON}
                                                                                className={styles.signature_icon}
                                                                                alt="Signature"
                                                                        />
                                                                        <span className={styles.title_text}>
                                                                                Signature
                                                                        </span>
                                                                </div>
                                                                <button
                                                                        onClick={() => setIsExpanded("")}
                                                                        className="cursor-pointer p-0 border-0 bg-transparent"
                                                                >
                                                                        <X className="h-5 w-5 cursor-pointer" />
                                                                </button>
                                                        </div>
                                                        {displayImageUrl ? (
                                                                <div style={{ position: "relative" }}>
                                                                        {imageLoading && (
                                                                                <div
                                                                                        style={{
                                                                                                position: "absolute",
                                                                                                top: 0,
                                                                                                left: 0,
                                                                                                width: "100%",
                                                                                                height: "100%",
                                                                                                zIndex: 1,
                                                                                                display: "flex",
                                                                                                alignItems: "center",
                                                                                                justifyContent: "center",
                                                                                        }}
                                                                                >
                                                                                        <Skeleton
                                                                                                className="rounded-md"
                                                                                                style={{
                                                                                                        width: "13.75rem",
                                                                                                        height: "9.375rem",
                                                                                                        background:
                                                                                                                "linear-gradient(270deg, #F7F8F9 0%, #DDE5EA 50.67%, #F7F8F9 100%)",
                                                                                                }}
                                                                                        />
                                                                                </div>
                                                                        )}
                                                                        <img
                                                                                src={displayImageUrl}
                                                                                alt="Signature"
                                                                                className={styles.signature_url_img}
                                                                                style={{
                                                                                        opacity: imageLoading ? 0 : 1,
                                                                                        transition: "opacity 0.2s",
                                                                                }}
                                                                                onLoad={handleImageLoad}
                                                                                onError={handleImageError}
                                                                        />
                                                                </div>
                                                        ) : (
                                                                <div className={styles.empty_signature}>
                                                                        No signature available
                                                                </div>
                                                        )}
                                                        <Button onClick={handleOpenDialog}>
                                                                <Pencil className="h-4 w-4 text-white" />
                                                                EDIT
                                                        </Button>
                                                </div>
                                        </div>
                                )}
                        </div>

                        {/* Signature Dialog */}
                        <Dialog
                                open={isExpanded === "open_dialog"}
                                onOpenChange={(open) => { if (!open) closeDialog(); }}
                        >
                                <DialogContent
                                        style={{ maxWidth: "33.625rem" }}
                                        onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                                        onInteractOutside={(e) => e.preventDefault()}
                                >
                                        <DialogHeader>
                                                <DialogTitle asChild>
                                                        <Header title="" />
                                                </DialogTitle>
                                        </DialogHeader>
                                        <div data-signature-dialog>
                                                <Content
                                                        handleSignatureChange={handleSignatureChange}
                                                        ref={signatureRef}
                                                        signatureImage={signatureImage}
                                                />
                                        </div>
                                        <DialogFooter>
                                                <Footer
                                                        onClose={closeDialog}
                                                        onSave={handleSave}
                                                        loading={loading}
                                                />
                                        </DialogFooter>
                                </DialogContent>
                        </Dialog>
                </>
        );
};
