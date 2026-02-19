import { useEffect, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
} from "@/components/ui/dialog";

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

	useEffect(() => {
		if (open) {
			reset({ name: tableName || "" });
		}
	}, [open, tableName, reset]);

	useEffect(() => {
		if (open) {
			setTimeout(() => {
				const inputElement = controlRef.current?.name;
				if (inputElement) {
					if (inputElement.focus) {
						inputElement.focus();
					} else {
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
				try {
					await updateTable(data);
					onSave(data);
					onClose();
				} catch (error) {
				}
			},
			(_errors) => {
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

	return (
		<Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
			<DialogContent className="max-w-[420px]">
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
				<DialogFooter>
					<RenameTableModalFooter
						onCancel={onClose}
						onSave={handleSave}
						loading={loading}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default RenameTableModal;
