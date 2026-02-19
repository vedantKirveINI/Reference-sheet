import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import React, { forwardRef } from "react";

import AddFieldContent from "./AddFieldContent";
import Footer from "./Footer";
import useAddField from "./hooks/useAddField";
import styles from "./styles.module.scss";

function FieldModal(
	{
		setCreationModal = () => {},
		creationModal = {},
		tableId = "",
		baseId = "",
		viewId = "",
		fields = [],
		onFieldSaveSuccess = () => {},
	},
	columnHeaderRef,
) {
	const { contentRef, onSave, loading } = useAddField({
		creationModal,
		setCreationModal,
		tableId,
		baseId,
		viewId,
		onFieldSaveSuccess,
	});

	const {
		open,
		editField,
		colIndex = NaN,
		position,
		anchorPosition,
	} = creationModal || {};

	const onClose = () => {
		setCreationModal({
			open: false,
			colIndex: -1,
			editField: null,
			newFieldOrder: null,
			columnId: null,
			position: null,
			anchorPosition: null,
		});
	};

	const isVisible = open && (colIndex > -1 || position === "append");

	if (!isVisible) return null;

	const getPosition = () => {
		if (anchorPosition) {
			const verticalOffset = position === "append" ? 10 : 6;
			return {
				top: anchorPosition.y + verticalOffset,
				left: anchorPosition.x,
			};
		}
		return null;
	};

	const pos = getPosition();

	return (
		<>
			{isVisible && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: 999,
					}}
					onClick={onClose}
				/>
			)}
			<div
				style={{
					position: "fixed",
					top: pos?.top ?? 100,
					left: pos?.left ?? 100,
					zIndex: 1000,
					margin: "0.25rem 0rem 0rem 0.25rem",
				}}
				onKeyDown={(e) => {
					e.stopPropagation();
				}}
				data-testid="add-field-modal"
			>
				<div className={styles.add_field_poppover}>
					<AddFieldContent
						value={editField}
						ref={contentRef}
						fields={fields}
					/>
					<Footer onClose={onClose} onSave={onSave} loading={loading} />
				</div>
			</div>
		</>
	);
}

export default forwardRef(FieldModal);
