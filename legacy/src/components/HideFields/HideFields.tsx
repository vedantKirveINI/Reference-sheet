import React, {
	useState,
	useMemo,
	useCallback,
	useRef,
	useEffect,
} from "react";
import ODSIcon from "oute-ds-icon";
import Popover from "oute-ds-popover";
import Button from "oute-ds-button";
import LoadingButton from "oute-ds-loading-button";
import { IColumn } from "@/types";
import { getColumnHiddenState } from "@/utils/columnMetaUtils";
import QUESTION_TYPE_ICON_MAPPING, {
	QuestionTypeIconKey,
} from "@/constants/questionTypeIconMapping";
import useUpdateColumnMeta from "@/hooks/useUpdateColumnMeta";
import getField from "@/common/forms/getField";
import useHideFieldsSettings from "./hooks/useHideFieldsSettings";
import styles from "./HideFields.module.scss";

interface HideFieldsProps {
	columns: IColumn[];
	parsedColumnMeta: Record<string, any>;
	viewId: string;
}

// Map CellType to icon mapping key (similar to ExpandedRecordField)
const getIconKey = (type: string): string => {
	const typeMap: Record<string, string> = {
		String: "SHORT_TEXT",
		Number: "NUMBER",
		DateTime: "DATE",
		Time: "TIME",
		MCQ: "MCQ",
		SCQ: "SCQ",
		YesNo: "YES_NO",
		PhoneNumber: "PHONE_NUMBER",
		ZipCode: "ZIP_CODE",
		Currency: "CURRENCY",
		DropDown: "DROP_DOWN",
		Address: "ADDRESS",
		Signature: "SIGNATURE",
		FileUpload: "FILE_PICKER",
		Ranking: "RANKING",
		Rating: "RATING",
		List: "LIST",
	};
	return typeMap[type] || "SHORT_TEXT";
};

const HideFields: React.FC<HideFieldsProps> = ({
	columns,
	parsedColumnMeta,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const hideFieldsRef = useRef<HTMLDivElement | null>(null);
	const { updateColumnMeta, loading } = useUpdateColumnMeta();

	// Get primary field (first field) - cannot be hidden
	const primaryField = columns[0];
	const primaryFieldId = primaryField
		? String((primaryField as any).rawId || primaryField.id)
		: null;

	// Use settings hook for form and controls
	const { formHook, controls, defaultValues } = useHideFieldsSettings({
		columns,
		parsedColumnMeta,
		primaryFieldId,
	});

	const { control, handleSubmit, reset, setValue, watch } = formHook;

	// Get current form values
	const currentValues = watch();

	// Filter controls based on search query
	const filteredControls = useMemo(() => {
		if (!searchQuery.trim()) {
			return controls;
		}
		const query = searchQuery.toLowerCase();
		return controls.filter((ctrl) =>
			ctrl.column.name.toLowerCase().includes(query),
		);
	}, [controls, searchQuery]);

	// Handle "Hide all" button - set all non-primary fields to hidden (false = hidden)
	const handleHideAll = useCallback(() => {
		controls.forEach((ctrl) => {
			if (!ctrl.isPrimary) {
				// Set to false (hidden) - form stores isVisible, so false = hidden
				setValue(ctrl.name, false, { shouldDirty: true });
			}
		});
	}, [controls, setValue]);

	// Handle "Show all" button - set all fields to visible (true = visible)
	const handleShowAll = useCallback(() => {
		controls.forEach((ctrl) => {
			// Set to true (visible)
			setValue(ctrl.name, true, { shouldDirty: true });
		});
	}, [controls, setValue]);

	// Handle Submit - send changes to backend
	const onSubmit = useCallback(
		async (data: Record<string, boolean>) => {
			// Find changed fields and convert to is_hidden format
			const updates = Object.entries(data)
				.filter(([fieldId, isVisible]) => {
					const defaultValue = defaultValues[fieldId];
					return defaultValue !== isVisible;
				})
				.map(([fieldId, isVisible]) => ({
					id: Number(fieldId),
					is_hidden: !isVisible, // Convert isVisible to is_hidden
				}));

			if (updates.length > 0) {
				await updateColumnMeta(updates);
				// Reset form with new values (they're now saved)
				reset(data);
				setIsOpen(false);
			} else {
				// No changes, just close
				setIsOpen(false);
			}
		},
		[defaultValues, updateColumnMeta, reset],
	);

	// Handle Cancel - reset form to default values and close
	const handleCancel = useCallback(() => {
		reset(); // Reset to defaultValues
		setSearchQuery("");
		setIsOpen(false);
	}, [reset]);

	// Reset form when popover opens or columns/parsedColumnMeta changes
	useEffect(() => {
		if (isOpen) {
			reset(defaultValues);
		}
	}, [isOpen, defaultValues, reset]);

	// Count hidden fields (from parsedColumnMeta, not localChanges since those are unsaved)
	const hiddenFieldsCount = useMemo(() => {
		return columns.filter((col) => {
			const fieldId = String((col as any).rawId || col.id);
			return getColumnHiddenState(fieldId, parsedColumnMeta);
		}).length;
	}, [columns, parsedColumnMeta]);

	// Get button text based on state
	const getButtonText = () => {
		if (hiddenFieldsCount > 0) {
			return `${hiddenFieldsCount} hidden ${hiddenFieldsCount === 1 ? "field" : "fields"}`;
		}
		return "Hide fields";
	};

	return (
		<>
			<div
				className={`${styles.hideFieldsButton} ${
					hiddenFieldsCount > 0
						? styles.hideFieldsButtonWithHidden
						: ""
				}`}
				onClick={() => setIsOpen(true)}
				ref={hideFieldsRef}
				data-testid="hide-fields-option"
			>
				<div className={styles.hideFieldsButtonIcon}>
					<ODSIcon
						outeIconName="OUTEVisibilityOffIcon"
						outeIconProps={{
							sx: {
								width: "1.25rem",
								height: "1.25rem",
								color: "var(--cell-text-primary-color)",
							},
						}}
					/>
				</div>
				<div className={styles.hideFieldsButtonLabel}>
					{getButtonText()}
				</div>
			</div>

			<Popover
				open={isOpen}
				anchorEl={hideFieldsRef.current}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				placement="bottom-start"
				onClose={handleCancel}
				sx={{
					zIndex: 200,
				}}
				slotProps={{
					paper: {
						sx: {
							border: "1px solid rgba(0, 0, 0, 0.08)",
							marginTop: "0.5rem",
							borderRadius: "0.5rem",
							boxShadow:
								"0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
						},
					},
				}}
			>
				<div className={styles.hideFieldsContainer}>
					{/* Search input */}
					<div className={styles.searchContainer}>
						<input
							type="text"
							placeholder="Find a field"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className={styles.searchInput}
						/>
					</div>

					{/* Fields list or empty state */}
					<div className={styles.fieldsList}>
						{filteredControls.length === 0 &&
						searchQuery.trim() !== "" ? (
							<div className={styles.emptyState}>
								<span className={styles.emptyStateText}>
									No results.
								</span>{" "}
								<button
									type="button"
									className={styles.emptyStateClear}
									onClick={() => setSearchQuery("")}
								>
									Clear
								</button>
							</div>
						) : (
							filteredControls.map((config) => {
								const { name, type, column, isPrimary } =
									config;
								const Element = getField(type); // Gets SwitchController

								if (!Element) return null;

								const iconKey = getIconKey(column.type);
								const fieldIcon =
									QUESTION_TYPE_ICON_MAPPING[
										iconKey as QuestionTypeIconKey
									];

								// Get current value from form (isVisible)
								const isVisible = currentValues[name] ?? true;
								const isHidden = !isVisible;

								return (
									<div
										key={name}
										className={`${styles.fieldItem} ${
											isPrimary ? styles.primaryField : ""
										}`}
										onClick={(e: React.MouseEvent) => {
											// Toggle when clicking anywhere on the field item
											if (!isPrimary) {
												const target =
													e.target as HTMLElement;
												const isSwitchInput =
													target.tagName ===
														"INPUT" ||
													target.closest("input");

												if (!isSwitchInput) {
													setValue(name, !isVisible, {
														shouldDirty: true,
													});
												}
											}
										}}
									>
										<div className={styles.toggleContainer}>
											<Element
												name={config.name}
												control={control}
												rules={config.rules}
												variant="black"
												size="small"
												disabled={isPrimary}
												title={
													isPrimary
														? "Primary field cannot be hidden"
														: isHidden
															? "Show field"
															: "Hide field"
												}
											/>
										</div>

										{/* Field icon and name */}
										<div className={styles.fieldInfo}>
											{fieldIcon && (
												<ODSIcon
													imageProps={{
														src: fieldIcon,
														className:
															styles.fieldIcon,
													}}
												/>
											)}
											<span className={styles.fieldName}>
												{column.name}
											</span>
										</div>
									</div>
								);
							})
						)}
					</div>

					{/* Footer buttons */}
					<div className={styles.footer}>
						<button
							className={styles.footerButton}
							onClick={handleHideAll}
							disabled={loading}
							type="button"
						>
							Hide all
						</button>
						<button
							className={styles.footerButton}
							onClick={handleShowAll}
							disabled={loading}
							type="button"
						>
							Show all
						</button>
					</div>

					{/* Save/Cancel buttons */}
					<div className={styles.actionFooter}>
						<Button
							variant="outlined"
							onClick={handleCancel}
							disabled={loading}
							type="button"
							className={styles.actionButtonCancel}
							sx={{
								fontSize: "0.8125rem",
								fontWeight: 500,
								padding: "0.4375rem 0.875rem",
								borderRadius: "0.375rem",
								textTransform: "none",
								minWidth: "4.5rem",
							}}
						>
							Cancel
						</Button>
						<LoadingButton
							variant="black"
							onClick={handleSubmit(onSubmit)}
							loading={loading}
							label="Save"
							type="button"
							className={styles.actionButtonSave}
							sx={{
								fontSize: "0.8125rem",
								fontWeight: 500,
								padding: "0.4375rem 0.875rem",
								borderRadius: "0.375rem",
								textTransform: "none",
								minWidth: "4.5rem",
							}}
						/>
					</div>
				</div>
			</Popover>
		</>
	);
};

export default HideFields;
