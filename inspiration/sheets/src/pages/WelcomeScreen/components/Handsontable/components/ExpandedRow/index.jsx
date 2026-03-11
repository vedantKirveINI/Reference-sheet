import ODSDialog from "oute-ds-dialog";
import { useState } from "react";

import ExpandedContentRenderer from "../ExpandedContent";
import ExpandedRowFooter from "../ExpandedFooter";
import ExpandedTitle from "../ExpandedTitle";

function ExpandedRow({
	expandedRow = {},
	setExpandedRow,
	records = [],
	fields = [],
	hotTableRef,
}) {
	const { open, rowIndex = 0 } = expandedRow || {};
	const [editedFields, setEditedFields] = useState({});

	const handleClose = () => {
		setExpandedRow({ open: false, rowIndex: 0 });
		setEditedFields({});
	};

	const handleFieldChange = (dbFieldName, value) => {
		setEditedFields((prev) => ({
			...prev,
			[dbFieldName]: value,
		}));
	};

	const handleSave = () => {
		const updatedCells = [];

		fields.forEach((field, colIndex) => {
			const { dbFieldName } = field;
			if (editedFields.hasOwnProperty(dbFieldName)) {
				updatedCells.push([
					rowIndex,
					colIndex,
					editedFields[dbFieldName],
				]);
			}
		});

		if (updatedCells.length > 0 && hotTableRef?.current) {
			hotTableRef.current.hotInstance.setDataAtCell(updatedCells);
		}

		setExpandedRow({ open: false, rowIndex: 0 });
		setEditedFields({});
	};

	return (
		<ODSDialog
			open={open}
			dialogWidth="60vw"
			showFullscreenIcon={false}
			hideBackdrop={false}
			onClose={handleClose}
			draggable={false}
			dialogTitle={<ExpandedTitle rowIndex={rowIndex} />}
			onKeyDown={(e) => e.stopPropagation()}
			dialogContent={
				<ExpandedContentRenderer
					fields={fields}
					record={records[rowIndex] || {}}
					onFieldChange={handleFieldChange}
					editedFields={editedFields}
				/>
			}
			removeContentPadding
			dialogActions={
				<ExpandedRowFooter onCancel={handleClose} onSave={handleSave} />
			}
		/>
	);
}

export default ExpandedRow;
