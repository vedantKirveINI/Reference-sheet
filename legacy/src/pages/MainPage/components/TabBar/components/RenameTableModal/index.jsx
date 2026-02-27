import { useEffect, useRef } from "react";
import ODSDialog from "oute-ds-dialog";

import useRenameTableSettings from "./hooks/useRenameTableSettings";
import useUpdateTable from "./hooks/useUpdateTable";
import RenameTableModalBody from "./RenameTableModalBody";
import RenameTableModalFooter from "./RenameTableModalFooter";

function RenameTableModal({
	open = false,
	onClose = () => {},
	tableName = "",
	position = null,
	baseId,
	tableId,
	onSave = () => {},
}) {
	const { formHook, controls } = useRenameTableSettings({
		value: { name: tableName },
	});

	const { updateTable, loading } = useUpdateTable({ baseId, tableId });

	const {
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = formHook;
	const controlRef = useRef({});

	// Reset form when modal opens with new tableName
	useEffect(() => {
		if (open) {
			reset({ name: tableName || "" });
		}
	}, [open, tableName, reset]);

	// Auto-focus input when modal opens
	useEffect(() => {
		if (open) {
			setTimeout(() => {
				const inputElement = controlRef.current?.name;
				if (inputElement) {
					// If it's an input element directly
					if (inputElement.focus) {
						inputElement.focus();
					} else {
						// If it's a component, try to find the input inside
						const input =
							inputElement.querySelector?.("input") ||
							inputElement.querySelector?.("textarea");
						if (input && input.focus) {
							input.focus();
						}
					}
				}
			}, 150);
		}
	}, [open]);

	const handleSave = () => {
		handleSubmit(
			async (data) => {
				// This function is called only when form validation passes
				try {
					await updateTable(data);
					onSave(data);
					onClose();
				} catch (error) {
					// Error already handled in updateTable hook
				}
			},
			(_errors) => {
				// Errors are automatically displayed by ErrorLabel components
			},
		)();
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSave();
		} else if (e.key === "Escape") {
			onClose();
		}
	};

	// Calculate dialog position - use coordinates if provided, otherwise center
	const dialogPosition = position ? "coordinates" : "center";
	const dialogCoordinates = position
		? {
				top: `${position.top}px`,
				left: `${position.left}px`,
			}
		: "";

	return (
		<ODSDialog
			open={open}
			onClose={onClose}
			dialogWidth="420px"
			showCloseIcon={false}
			showFullscreenIcon={false}
			draggable={false}
			dialogPosition={dialogPosition}
			dialogCoordinates={dialogCoordinates}
			dialogContent={
				<form
					onKeyDown={handleKeyDown}
					onSubmit={(e) => e.preventDefault()}
				>
					<RenameTableModalBody
						controls={controls}
						control={control}
						errors={errors}
						controlRef={controlRef}
					/>
				</form>
			}
			dialogActions={
				<RenameTableModalFooter
					onCancel={onClose}
					onSave={handleSave}
					loading={loading}
				/>
			}
			dividers={true}
			removeContentPadding={false}
		/>
	);
}

export default RenameTableModal;
