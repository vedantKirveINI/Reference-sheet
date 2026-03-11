import ODSPopover from "oute-ds-popover";
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

	// Determine anchor element or position.
	// Prefer explicit anchor coordinates when provided (append & context menu cases).
	const getAnchorElement = () => {
		if (anchorPosition) {
			return null;
		}
		return columnHeaderRef?.current?.[colIndex] ?? null;
	};

	const getAnchorPosition = () => {
		if (!anchorPosition) {
			return undefined;
		}

		// Slightly offset the popover so it doesn't overlap the trigger area.
		const verticalOffset = position === "append" ? 10 : 6;
		const horizontalOffset = 0;

		return {
			top: anchorPosition.y + verticalOffset,
			left: anchorPosition.x + horizontalOffset,
		};
	};

	const anchorPos = getAnchorPosition();
	const useAnchorPosition = Boolean(anchorPos);

	return (
		<ODSPopover
			open={open && (colIndex > -1 || position === "append")}
			anchorReference={useAnchorPosition ? "anchorPosition" : "anchorEl"}
			anchorEl={useAnchorPosition ? null : getAnchorElement()}
			anchorPosition={useAnchorPosition ? anchorPos : undefined}
			anchorOrigin={{
				vertical: "bottom",
				horizontal: "left",
			}}
			onClose={onClose}
			onKeyDown={(e) => {
				e.stopPropagation();
			}}
			sx={{
				margin: "0.25rem 0rem 0rem 0.25rem",
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
		</ODSPopover>
	);
}

export default forwardRef(FieldModal);
