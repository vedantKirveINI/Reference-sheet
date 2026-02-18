import { isEmpty } from "lodash";
import ODSIcon from "@/lib/oute-icon";
import React, { memo, useRef, useState, useEffect, useMemo } from "react";

import useSort from "./hooks/useSort";
import SortContent from "./SortContent/index";
import { useModalControlStore } from "@/stores/modalControlStore";
import { ORDER_BY_OPTIONS_MAPPING } from "./constant";

interface SortFieldDefinition {
	id: string | number;
	name: string;
	dbFieldName?: string;
	type?: string;
}

interface SortConfig {
	sortObjs?: Array<{
		fieldId?: string;
		order?: string;
		dbFieldName?: string;
		type?: string;
	}>;
	manualSort?: boolean;
}

interface SortModalProps {
	sort?: SortConfig;
	fields?: SortFieldDefinition[];
	activeBackgroundColor?: string;
}

const SortModal: React.FC<SortModalProps> = ({
	sort = { sortObjs: [] },
	fields = [],
	activeBackgroundColor,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const sortModalState = useModalControlStore(
		(state) => state.sortModalState,
	);
	const closeSortModal = useModalControlStore(
		(state) => state.closeSortModal,
	);

	const mergedSort = useMemo(() => {
		if (sortModalState.isOpen && sortModalState.initialSort) {
			const existingSortObjs = sort?.sortObjs || [];
			const initialSortObjs = sortModalState.initialSort?.sortObjs || [];
			const combined = [...existingSortObjs, ...initialSortObjs];
			const unique = combined.filter(
				(item, index, self) =>
					index ===
					self.findIndex(
						(t) =>
							String(t.fieldId || t.field?.value) ===
							String(item.fieldId || item.field?.value),
					),
			);
			return {
				...sort,
				sortObjs: unique,
				manualSort: sort?.manualSort || false,
			};
		}
		return sort;
	}, [sort, sortModalState.isOpen, sortModalState.initialSort]);

	useEffect(() => {
		if (sortModalState.isOpen && !isOpen) {
			setIsOpen(true);
		}
	}, [sortModalState.isOpen, isOpen]);

	const {
		sortFields: originalSortFields = () => {},
		handleClick = () => {},
		loading = false,
		updatedSortObjs,
		sortFieldOptions,
	} = useSort({
		isOpen,
		setIsOpen,
		sort: mergedSort,
		fields:
			sortModalState.fields.length > 0 ? sortModalState.fields : fields,
	});

	const sortFields = async (data: any) => {
		await originalSortFields(data);
		closeSortModal();
	};

	const originalSortForActiveState = useMemo(() => {
		const sortObjs = sort?.sortObjs || [];
		const fieldOptions = fields.map((f) => ({
			label: f?.name,
			value: f?.id,
			dbFieldName: f?.dbFieldName,
			type: f?.type,
		}));

		return sortObjs
			.map((field) => ({
				field: fieldOptions.find(
					(option) => option?.value === field?.fieldId,
				),
				order: ORDER_BY_OPTIONS_MAPPING.find(
					(option) => option?.value === field?.order,
				),
			}))
			.filter((sortObj) => sortObj?.field);
	}, [sort, fields]);

	const getSortTitle = useMemo(() => {
		return () => {
			if (isEmpty(originalSortForActiveState)) {
				return "Sort";
			}

			let sortTitle = "";

			for (let i = 0; i < originalSortForActiveState.length; i++) {
				const { field = {} } = originalSortForActiveState[i] || {};

				if (i > 2) {
					const firstField = originalSortForActiveState[0]?.field;
					const remainingFieldLength =
						originalSortForActiveState.length - 1;

					sortTitle = `Sorted by ${firstField?.label} and ${remainingFieldLength} others`;
					break;
				}

				if (i === 0) {
					sortTitle = `Sorted by ${field?.label}`;
				} else {
					sortTitle += `, ${field?.label}`;
				}
			}

			return sortTitle;
		};
	}, [originalSortForActiveState]);

	const sortRef = useRef<HTMLDivElement | null>(null);
	const popoverRef = useRef<HTMLDivElement | null>(null);

	const handleClose = () => {
		setIsOpen(false);
		closeSortModal();
	};

	const isActive = !isEmpty(originalSortForActiveState);

	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node) &&
				sortRef.current &&
				!sortRef.current.contains(e.target as Node)
			) {
				handleClose();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	return (
		<>
			<div
				className={`flex items-center cursor-pointer py-1 px-2 rounded-md transition-colors duration-200 hover:bg-[#eceff1] ${isActive && !activeBackgroundColor ? "bg-[#b1edd0]" : ""}`}
				style={
					isActive && activeBackgroundColor
						? {
								backgroundColor: activeBackgroundColor,
								border: `1.5px solid ${activeBackgroundColor === "#fefce8" ? "#fbbf24" : "#3b82f6"}`,
							}
						: undefined
				}
				onClick={() => handleClick()}
				ref={sortRef}
				data-testid="sort-option"
			>
				<div className="flex items-center">
					<ODSIcon
						outeIconName="OUTESwapHorizontal"
						outeIconProps={{
							className: "rotate-90 w-[1.125rem] h-[1.125rem] text-[var(--cell-text-primary-color)]",
						}}
					/>
				</div>
				<div className="text-sm text-[var(--cell-text-primary-color)] whitespace-nowrap">{getSortTitle()}</div>
			</div>

			{isOpen && (
				<div
					ref={popoverRef}
					className="fixed z-[200] mt-3.5 border border-[#CFD8DC] bg-white rounded-lg shadow-lg"
					style={{
						top: sortRef.current
							? sortRef.current.getBoundingClientRect().bottom
							: 0,
						left: sortRef.current
							? sortRef.current.getBoundingClientRect().left
							: 0,
					}}
				>
					<SortContent
						updatedSortObjs={updatedSortObjs}
						sortFieldOptions={sortFieldOptions}
						onClose={handleClose}
						onSave={sortFields}
						loading={loading}
					/>
				</div>
			)}
		</>
	);
};

export default memo(SortModal);
