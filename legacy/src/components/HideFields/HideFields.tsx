import React, {
	useState,
	useMemo,
	useCallback,
	useRef,
	useEffect,
} from "react";
import ODSIcon from "@/lib/oute-icon";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { IColumn } from "@/types";
import { getColumnHiddenState } from "@/utils/columnMetaUtils";
import QUESTION_TYPE_ICON_MAPPING, {
	QuestionTypeIconKey,
} from "@/constants/questionTypeIconMapping";
import useUpdateColumnMeta from "@/hooks/useUpdateColumnMeta";
import getField from "@/common/forms/getField";
import useHideFieldsSettings from "./hooks/useHideFieldsSettings";

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
	const popoverRef = useRef<HTMLDivElement | null>(null);
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

	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node) &&
				hideFieldsRef.current &&
				!hideFieldsRef.current.contains(e.target as Node)
			) {
				handleCancel();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen, handleCancel]);

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
				className={`flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer transition-colors duration-150 select-none hover:bg-black/[0.04] ${hiddenFieldsCount > 0 ? "bg-blue-500/[0.06] hover:bg-blue-500/10" : ""}`}
				onClick={() => setIsOpen(true)}
				ref={hideFieldsRef}
				data-testid="hide-fields-option"
			>
				<div className="flex items-center justify-center">
					<ODSIcon
						outeIconName="OUTEVisibilityOffIcon"
						outeIconProps={{
							className: "w-5 h-5 text-[var(--cell-text-primary-color)]",
						}}
					/>
				</div>
				<div className="font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[0.8125rem] font-medium text-[var(--cell-text-primary-color,#374151)] tracking-[0.01em] whitespace-nowrap">
					{getButtonText()}
				</div>
			</div>

			{isOpen && (
				<div
					ref={popoverRef}
					className="fixed z-[200] mt-2 bg-white border border-black/[0.08] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]"
					style={{
						top: hideFieldsRef.current
							? hideFieldsRef.current.getBoundingClientRect().bottom
							: 0,
						left: hideFieldsRef.current
							? hideFieldsRef.current.getBoundingClientRect().left
							: 0,
					}}
				>
					<div className="bg-white rounded-lg min-w-[300px] max-w-[360px] flex flex-col overflow-hidden">
						<div className="py-3 px-4 border-b border-black/[0.06]">
							<input
								type="text"
								placeholder="Find a field"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full py-2 px-0 border-none text-sm font-normal font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[#111827] outline-none bg-transparent placeholder:text-[#9ca3af]"
							/>
						</div>

						<div className="max-h-[320px] overflow-y-auto py-1">
							{filteredControls.length === 0 &&
							searchQuery.trim() !== "" ? (
								<div className="flex items-center justify-center py-4 px-4 gap-1">
									<span className="text-sm text-[#6b7280]">
										No results.
									</span>{" "}
									<button
										type="button"
										className="text-sm text-[#3b82f6] bg-transparent border-none cursor-pointer hover:underline"
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
											className={`flex items-center py-1.5 px-4 cursor-pointer hover:bg-[#f9fafb] transition-colors duration-100 ${isPrimary ? "opacity-60 cursor-default" : ""}`}
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
											<div className="mr-2 flex items-center">
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

											<div className="flex items-center gap-2 flex-1 min-w-0">
												{fieldIcon && (
													<ODSIcon
														imageProps={{
															src: fieldIcon,
															className: "w-4 h-4 opacity-50 flex-shrink-0",
														}}
													/>
												)}
												<span className="text-[13px] font-normal text-[#111827] truncate font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif]">
													{column.name}
												</span>
											</div>
										</div>
									);
								})
							)}
						</div>

						<div className="flex items-center gap-3 px-4 py-2.5 border-t border-black/[0.06]">
							<button
								className="text-xs font-medium text-[#6b7280] bg-transparent border-none cursor-pointer hover:text-[#111827] transition-colors"
								onClick={handleHideAll}
								disabled={loading}
								type="button"
							>
								Hide all
							</button>
							<button
								className="text-xs font-medium text-[#6b7280] bg-transparent border-none cursor-pointer hover:text-[#111827] transition-colors"
								onClick={handleShowAll}
								disabled={loading}
								type="button"
							>
								Show all
							</button>
						</div>

						<div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-black/[0.06]">
							<Button
								variant="outline"
								onClick={handleCancel}
								disabled={loading}
								className="text-[0.8125rem] font-medium py-[0.4375rem] px-3.5 rounded-md normal-case min-w-[4.5rem]"
							>
								Cancel
							</Button>
							<Button
								variant="default"
								onClick={handleSubmit(onSubmit)}
								disabled={loading}
								className="text-[0.8125rem] font-medium py-[0.4375rem] px-3.5 rounded-md normal-case min-w-[4.5rem]"
							>
								{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Save
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default HideFields;
