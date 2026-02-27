import { isEmpty } from "lodash";
import Icon from "oute-ds-icon";
import Popover from "oute-ds-popover";
import React, { memo, useRef, useState, useEffect, useMemo } from "react";

import useSort from "./hooks/useSort";
import SortContent from "./SortContent/index";
import { useModalControlStore } from "@/stores/modalControlStore";
import { ORDER_BY_OPTIONS_MAPPING } from "./constant";
import styles from "./styles.module.scss";

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
	activeBackgroundColor?: string; // Optional background color when sort is active
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

	// Merge store initial sort with prop sort
	const mergedSort = useMemo(() => {
		if (sortModalState.isOpen && sortModalState.initialSort) {
			// initialSort from store is already in API format
			// Merge with existing sort (also in API format)
			const existingSortObjs = sort?.sortObjs || [];
			const initialSortObjs = sortModalState.initialSort?.sortObjs || [];
			// Combine and deduplicate by fieldId
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

	// Open modal when store state changes
	useEffect(() => {
		if (sortModalState.isOpen && !isOpen) {
			setIsOpen(true);
		}
	}, [sortModalState.isOpen, isOpen]);

	// Use merged sort ONLY for modal content (form inside modal)
	const {
		sortFields: originalSortFields = () => {},
		handleClick = () => {},
		loading = false,
		updatedSortObjs,
		sortFieldOptions,
	} = useSort({
		isOpen,
		setIsOpen,
		sort: mergedSort, // Use merged sort for modal content only
		fields:
			sortModalState.fields.length > 0 ? sortModalState.fields : fields,
	});

	// Wrap sortFields to also close the modal store state after save
	const sortFields = async (data: any) => {
		await originalSortFields(data);
		// After successful save, also reset the store state
		closeSortModal();
	};

	// Use original sort (from view) for title and active state - only show what's actually saved
	// This prevents showing pre-filled values in title/active state before save
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

	// Compute title from original sort (what's actually saved)
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

	// Handle modal close - reset store state
	const handleClose = () => {
		setIsOpen(false);
		closeSortModal();
	};

	const isActive = !isEmpty(originalSortForActiveState);

	return (
		<>
			<div
				className={`${styles.sort_option} ${
					isActive && !activeBackgroundColor
						? styles.sort_view_highlighted
						: ""
				}`}
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
				<div className={styles.sort_option_icon}>
					<Icon
						outeIconName="OUTESwapHorizontal"
						outeIconProps={{
							sx: {
								transform: "rotate(90deg)",
								width: "1.125rem",
								height: "1.125rem",
								color: "var(--cell-text-primary-color)",
							},
						}}
					/>
				</div>
				<div className={styles.sort_option_label}>{getSortTitle()}</div>
			</div>

			<Popover
				open={isOpen}
				anchorEl={sortRef?.current}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				placement="bottom-start"
				onClose={handleClose}
				sx={{
					zIndex: 200,
				}}
				slotProps={{
					paper: {
						sx: {
							border: "0.047rem solid #CFD8DC",
							marginTop: "0.875rem",
						},
					},
				}}
			>
				<SortContent
					updatedSortObjs={updatedSortObjs}
					sortFieldOptions={sortFieldOptions}
					onClose={handleClose}
					onSave={sortFields}
					loading={loading}
				/>
			</Popover>
		</>
	);
};

export default memo(SortModal);
