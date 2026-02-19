import React, {
	useState,
	useMemo,
	useCallback,
	useRef,
	useEffect,
} from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { EyeOff } from "lucide-react";
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

	const primaryField = columns[0];
	const primaryFieldId = primaryField
		? String((primaryField as any).rawId || primaryField.id)
		: null;

	const { formHook, controls, defaultValues } = useHideFieldsSettings({
		columns,
		parsedColumnMeta,
		primaryFieldId,
	});

	const { control, handleSubmit, reset, setValue, watch } = formHook;

	const currentValues = watch();

	const filteredControls = useMemo(() => {
		if (!searchQuery.trim()) {
			return controls;
		}
		const query = searchQuery.toLowerCase();
		return controls.filter((ctrl) =>
			ctrl.column.name.toLowerCase().includes(query),
		);
	}, [controls, searchQuery]);

	const handleHideAll = useCallback(() => {
		controls.forEach((ctrl) => {
			if (!ctrl.isPrimary) {
				setValue(ctrl.name, false, { shouldDirty: true });
			}
		});
	}, [controls, setValue]);

	const handleShowAll = useCallback(() => {
		controls.forEach((ctrl) => {
			setValue(ctrl.name, true, { shouldDirty: true });
		});
	}, [controls, setValue]);

	const onSubmit = useCallback(
		async (data: Record<string, boolean>) => {
			const updates = Object.entries(data)
				.filter(([fieldId, isVisible]) => {
					const defaultValue = defaultValues[fieldId];
					return defaultValue !== isVisible;
				})
				.map(([fieldId, isVisible]) => ({
					id: Number(fieldId),
					is_hidden: !isVisible,
				}));

			if (updates.length > 0) {
				await updateColumnMeta(updates);
				reset(data);
				setIsOpen(false);
			} else {
				setIsOpen(false);
			}
		},
		[defaultValues, updateColumnMeta, reset],
	);

	const handleCancel = useCallback(() => {
		reset();
		setSearchQuery("");
		setIsOpen(false);
	}, [reset]);

	useEffect(() => {
		if (isOpen) {
			reset(defaultValues);
		}
	}, [isOpen, defaultValues, reset]);

	const hiddenFieldsCount = useMemo(() => {
		return columns.filter((col) => {
			const fieldId = String((col as any).rawId || col.id);
			return getColumnHiddenState(fieldId, parsedColumnMeta);
		}).length;
	}, [columns, parsedColumnMeta]);

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
					<EyeOff
						style={{
							width: "1.25rem",
							height: "1.25rem",
							color: "var(--cell-text-primary-color)",
						}}
					/>
				</div>
				<div className={styles.hideFieldsButtonLabel}>
					{getButtonText()}
				</div>
			</div>

			<Popover open={isOpen} onOpenChange={(open) => { if (!open) handleCancel(); }}>
				<PopoverTrigger asChild>
					<span style={{ display: "none" }} />
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="p-0"
					style={{
						border: "1px solid rgba(0, 0, 0, 0.08)",
						borderRadius: "0.5rem",
						boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
						width: "auto",
						maxWidth: "none",
					}}
				>
					<div className={styles.hideFieldsContainer}>
						<div className={styles.searchContainer}>
							<input
								type="text"
								placeholder="Find a field"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className={styles.searchInput}
							/>
						</div>

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
									const Element = getField(type);

									if (!Element) return null;

									const iconKey = getIconKey(column.type);
									const fieldIcon =
										QUESTION_TYPE_ICON_MAPPING[
											iconKey as QuestionTypeIconKey
										];

									const isVisible = currentValues[name] ?? true;
									const isHidden = !isVisible;

									return (
										<div
											key={name}
											className={`${styles.fieldItem} ${
												isPrimary ? styles.primaryField : ""
											}`}
											onClick={(e: React.MouseEvent) => {
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

											<div className={styles.fieldInfo}>
												{fieldIcon && (
													<img
														src={fieldIcon}
														className={styles.fieldIcon}
														alt=""
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

						<div className={styles.actionFooter}>
							<Button
								variant="outline"
								onClick={handleCancel}
								disabled={loading}
								type="button"
								className={styles.actionButtonCancel}
								style={{
									fontSize: "0.8125rem",
									fontWeight: 500,
									textTransform: "none",
									minWidth: "4.5rem",
								}}
							>
								Cancel
							</Button>
							<Button
								onClick={handleSubmit(onSubmit)}
								disabled={loading}
								type="button"
								className={styles.actionButtonSave}
								style={{
									fontSize: "0.8125rem",
									fontWeight: 500,
									textTransform: "none",
									minWidth: "4.5rem",
								}}
							>
								{loading ? "..." : "Save"}
							</Button>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</>
	);
};

export default HideFields;
