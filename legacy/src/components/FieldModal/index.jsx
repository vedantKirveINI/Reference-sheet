import React, { forwardRef, useState, useEffect, useRef } from "react";

import AddFieldContent from "./AddFieldContent";
import Footer from "./Footer";
import useAddField from "./hooks/useAddField";

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

	const popoverRef = useRef(null);
	const [popoverStyle, setPopoverStyle] = useState({});

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

	const isOpen = open && (colIndex > -1 || position === "append");

	useEffect(() => {
		if (!isOpen) return;

		const computePosition = () => {
			if (anchorPosition) {
				const verticalOffset = position === "append" ? 10 : 6;
				setPopoverStyle({
					position: "fixed",
					top: `${anchorPosition.y + verticalOffset}px`,
					left: `${anchorPosition.x}px`,
					zIndex: 1000,
					margin: "0.25rem 0rem 0rem 0.25rem",
				});
			} else {
				const anchorEl = columnHeaderRef?.current?.[colIndex];
				if (anchorEl) {
					const rect = anchorEl.getBoundingClientRect();
					setPopoverStyle({
						position: "fixed",
						top: `${rect.bottom}px`,
						left: `${rect.left}px`,
						zIndex: 1000,
						margin: "0.25rem 0rem 0rem 0.25rem",
					});
				}
			}
		};

		computePosition();
	}, [isOpen, anchorPosition, position, colIndex, columnHeaderRef]);

	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e) => {
			if (popoverRef.current && !popoverRef.current.contains(e.target)) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<>
			<div
				ref={popoverRef}
				style={popoverStyle}
				onKeyDown={(e) => e.stopPropagation()}
				data-testid="add-field-modal"
			>
				<div className="w-[30rem] rounded-lg border border-[#e5e7eb] shadow-[0_0.25rem_0.5rem_rgba(0,0,0,0.1),0_0.5rem_1.5rem_rgba(0,0,0,0.08),0_1rem_3rem_rgba(0,0,0,0.06)] bg-white overflow-hidden">
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
