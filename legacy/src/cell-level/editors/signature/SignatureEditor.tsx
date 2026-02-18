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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ODSIcon from "@/lib/oute-icon";
import { Icon } from "@/lib/oute-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { ISignatureCell } from "@/types";
import Content from "./components/Content";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { useSignatureEditor } from "./hooks/useSignatureEditor";
import { SIGNATURE_ICON } from "@/constants/Icons/questionTypeIcons";

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

const SIGNATURE_MIN_WIDTH = 80;
const SIGNATURE_MIN_HEIGHT = 24;
const SIGNATURE_ASPECT_RATIO = 80 / 24;
const SIGNATURE_PADDING = 4;

const INPUT_CONTAINER_PADDING_X = 6.88;
const INPUT_CONTAINER_PADDING_Y = 3;
const ACTION_CONTAINER_GAP = 10;
const ACTION_ICON_SIZE = 20;
const ACTION_CONTAINER_WIDTH = ACTION_ICON_SIZE * 2 + ACTION_CONTAINER_GAP;

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

	const displayImageUrl = currentImageUrl || initialValue;

	const signatureImageSize = useMemo(() => {
		const availableWidth =
			rect.width -
			PADDING_WIDTH * 2 -
			INPUT_CONTAINER_PADDING_X * 2 -
			(displayImageUrl ? ACTION_CONTAINER_WIDTH : 0) -
			SIGNATURE_PADDING * 2;

		const availableHeight =
			rect.height -
			PADDING_HEIGHT * 2 -
			INPUT_CONTAINER_PADDING_Y * 2 -
			SIGNATURE_PADDING * 2;

		let imgWidthByWidth = Math.min(
			availableWidth,
			availableHeight * SIGNATURE_ASPECT_RATIO,
		);
		let imgHeightByWidth = imgWidthByWidth / SIGNATURE_ASPECT_RATIO;

		let imgHeightByHeight = Math.min(
			availableHeight,
			availableWidth / SIGNATURE_ASPECT_RATIO,
		);
		let imgWidthByHeight = imgHeightByHeight * SIGNATURE_ASPECT_RATIO;

		let imgWidth: number;
		let imgHeight: number;

		if (
			imgWidthByWidth <= availableWidth &&
			imgHeightByWidth <= availableHeight
		) {
			imgWidth = imgWidthByWidth;
			imgHeight = imgHeightByWidth;
		} else {
			imgWidth = imgWidthByHeight;
			imgHeight = imgHeightByHeight;
		}

		imgWidth = Math.max(SIGNATURE_MIN_WIDTH, imgWidth);
		imgHeight = Math.max(SIGNATURE_MIN_HEIGHT, imgHeight);

		if (imgWidth > availableWidth || imgHeight > availableHeight) {
			const widthScale = availableWidth / imgWidth;
			const heightScale = availableHeight / imgHeight;
			const scale = Math.min(widthScale, heightScale);
			imgWidth = imgWidth * scale;
			imgHeight = imgHeight * scale;
			imgWidth = Math.max(SIGNATURE_MIN_WIDTH, imgWidth);
			imgHeight = Math.max(SIGNATURE_MIN_HEIGHT, imgHeight);
		}

		return {
			width: Math.round(imgWidth),
			height: Math.round(imgHeight),
		};
	}, [rect.width, rect.height, displayImageUrl]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && isExpanded !== "open_dialog") {
				e.preventDefault();
				e.stopPropagation();
				onChange(initialValue);
				onSave?.();
				if (onEnterKey) {
					requestAnimationFrame(() => {
						onEnterKey(e.shiftKey);
					});
				}
			} else if (e.key === "Tab") {
				e.preventDefault();
				e.stopPropagation();
				onChange(initialValue);
				onSave?.();
			} else if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
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

	const handleBlur = useCallback(() => {
		setTimeout(() => {
			if (
				isExpanded === "open_dialog" ||
				isExpanded === "expanded_view"
			) {
				return;
			}

			const activeElement = document.activeElement;

			const expandedViewElement = document.querySelector(
				"[data-signature-expanded-view]",
			);

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
				return;
			}

			onChange(initialValue);
			onSave?.();
		}, 100);
	}, [onSave, onChange, initialValue, isExpanded]);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
	}, []);

	const handleOpenDialog = useCallback(
		(e?: React.MouseEvent | any) => {
			if (e) {
				e.stopPropagation();
			}

			openDialog();
		},
		[openDialog],
	);

	const handleEditButtonMouseDown = useCallback((e: React.MouseEvent) => {
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
		<>
			<div
				ref={containerRef}
				className="box-border outline-none flex flex-col h-full"
				style={editorStyle}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
				onMouseDown={handleMouseDown}
				tabIndex={-1}
				data-testid="signature-editor"
			>
				<div
					className="flex items-center px-[6.88px] py-[3px] min-h-0 w-full flex-1 overflow-hidden"
					style={{
						justifyContent: displayImageUrl
							? "space-between"
							: "flex-end",
					}}
				>
					{displayImageUrl && (
						<div
							className="relative"
							style={{
								width: `${signatureImageSize.width}px`,
								height: `${signatureImageSize.height}px`,
							}}
						>
							{imageLoading && (
								<div className="absolute top-0 left-0 w-full h-full z-[1]">
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
					<div className="flex gap-[10px] items-center">
						<div
							onMouseDown={handleEditButtonMouseDown}
							onClick={handleOpenDialog}
							data-testid="signature-edit-icon"
							className="cursor-pointer flex items-center justify-center select-none"
						>
							<ODSIcon
								outeIconName="OUTEEditIcon"
								outeIconProps={{
									className: "bg-[#21212133] text-[#212121] rounded-sm w-5 h-5 pointer-events-none hover:bg-[#212121] hover:text-white",
								}}
							/>
						</div>

						{displayImageUrl && (
							<div
								ref={popoverRef}
								data-testid="signature-expand-icon"
								onClick={() => setIsExpanded("expanded_view")}
								className="cursor-pointer flex items-center justify-center select-none"
							>
								<ODSIcon
									outeIconName="OUTEOpenFullscreenIcon"
									outeIconProps={{
										className: "text-white bg-[#212121] pointer-events-none hover:bg-[#4d4d4d] rounded-sm w-5 h-5",
									}}
								/>
							</div>
						)}
					</div>
				</div>

				{isExpanded === "expanded_view" && (
					<div
						className="bg-white border-[0.047rem] border-[#cfd8dc] rounded-md shadow-[0rem_0.375rem_0.75rem_0rem_rgba(122,124,141,0.2)] overflow-hidden"
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
						<div className="flex flex-col gap-6 p-5">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-[0.375rem]">
									<Icon
										imageProps={{
											src: SIGNATURE_ICON,
											className: "w-5 h-5",
										}}
									/>
									<span className="font-sans text-base font-medium">
										Signature
									</span>
								</div>
								<ODSIcon
									outeIconName="OUTECloseIcon"
									onClick={() => setIsExpanded("")}
									outeIconProps={{
										className: "cursor-pointer",
									}}
									buttonProps={{
										className: "p-0",
									}}
								/>
							</div>
							{displayImageUrl ? (
								<div className="relative">
									{imageLoading && (
										<div className="absolute top-0 left-0 w-full h-full z-[1] flex items-center justify-center">
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
										className="w-[13.75rem] h-[9.375rem] object-contain"
										style={{
											opacity: imageLoading ? 0 : 1,
											transition: "opacity 0.2s",
										}}
										onLoad={handleImageLoad}
										onError={handleImageError}
									/>
								</div>
							) : (
								<div className="text-[#9e9e9e] text-sm text-center">
									No signature available
								</div>
							)}
							<Button
								variant="default"
								onClick={handleOpenDialog}
							>
								<ODSIcon
									outeIconName="OUTEEditIcon"
									outeIconProps={{
										className: "text-white",
									}}
								/>
								EDIT
							</Button>
						</div>
					</div>
				)}
			</div>

			<Dialog
				open={isExpanded === "open_dialog"}
				onOpenChange={(v) => {
					if (!v) closeDialog();
				}}
			>
				<DialogContent
					className="max-w-[33.625rem] p-0"
					onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
				>
					<DialogHeader className="px-6 pt-6">
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
					<Footer
						onClose={closeDialog}
						onSave={handleSave}
						loading={loading}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};
