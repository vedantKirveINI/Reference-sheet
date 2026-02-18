import { useEffect, useRef } from "react";
import ODSDialog from "oute-ds-dialog";
import { useViewStore } from "@/stores/viewStore";
import useDecodedUrlParams from "@/hooks/useDecodedUrlParams";
import useCreateView from "./hooks/useCreateView";
import useCreateViewSettings from "./hooks/useCreateViewSettings";
import CreateViewModalBody from "./CreateViewModalBody";
import CreateViewModalFooter from "./CreateViewModalFooter";
import { ViewType } from "@/types/view";
import type { IColumn } from "@/types";

interface CreateViewModalProps {
	open: boolean;
	onClose: () => void;
	columns?: IColumn[];
}

function CreateViewModal({
	open = false,
	onClose = () => {},
	columns = [],
}: CreateViewModalProps) {
	const { formHook, controls } = useCreateViewSettings({
		columns,
	});
	const { assetId: baseId, tableId } = useDecodedUrlParams();
	const { views } = useViewStore();
	const { createView, loading } = useCreateView();

	const {
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = formHook;
	const controlRef = useRef<Record<string, any>>({});

	// Reset form when modal opens
	useEffect(() => {
		if (open) {
			reset({
				name: "",
				type: ViewType.Grid,
				stackingField: null,
				hideEmptyStack: false,
			});
		}
	}, [open, reset]);

	// Auto-focus input when modal opens
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
			async (data: any) => {
				if (!baseId || !tableId) return;

				try {
					const viewTypeValue =
						data.type?.value || data.type || ViewType.Grid;
					const payload = {
						table_id: tableId,
						baseId,
						name: data.name,
						type: viewTypeValue,
						version: 1,
						columnMeta: "{}",
						order: views.length + 1,
						options:
							viewTypeValue === ViewType.Kanban &&
							data.stackingField
								? {
										stackFieldId: Number(
											data.stackingField,
										),
										isEmptyStackHidden:
											data.hideEmptyStack || false,
									}
								: undefined,
					};

					const newView = await createView(payload);

					if (newView) {
						onClose();
					}
				} catch (error) {
					// Error already handled in createView hook
				}
			},
			(_errors: any) => {},
		)();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSave();
		} else if (e.key === "Escape") {
			onClose();
		}
	};

	return (
		<ODSDialog
			open={open}
			onClose={onClose}
			dialogWidth="480px"
			showCloseIcon={false}
			showFullscreenIcon={false}
			draggable={false}
			dialogPosition="center"
			dialogContent={
				<form
					onKeyDown={handleKeyDown}
					onSubmit={(e) => e.preventDefault()}
				>
					<CreateViewModalBody
						controls={controls}
						control={control}
						errors={errors}
						controlRef={controlRef}
						columns={columns}
					/>
				</form>
			}
			dialogActions={
				<CreateViewModalFooter
					onCancel={onClose}
					onSave={handleSave}
					loading={loading}
				/>
			}
			// dividers={true}
			removeContentPadding={false}
		/>
	);
}

export default CreateViewModal;
