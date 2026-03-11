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
	},
	columnHeaderRef,
) {
	const { contentRef, onSave, loading } = useAddField({
		creationModal,
		setCreationModal,
		tableId,
		baseId,
		viewId,
	});

	const { open, editField, colIndex = NaN } = creationModal || {};

	const onClose = () => {
		setCreationModal({ open: false });
	};

	return (
		<ODSPopover
			open={open && colIndex > -1}
			anchorEl={columnHeaderRef?.current[colIndex]}
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
