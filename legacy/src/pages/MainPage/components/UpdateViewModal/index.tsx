import { useEffect } from "react";
import ODSDialog from "oute-ds-dialog";
import useDecodedUrlParams from "@/hooks/useDecodedUrlParams";
import useUpdateViewSettings from "@/pages/MainPage/components/UpdateViewModal/hooks/useUpdateViewSettings";
import UpdateViewModalBody from "@/pages/MainPage/components/UpdateViewModal/UpdateViewModalBody";
import useUpdateKanbanViewOptions from "@/pages/MainPage/hooks/useUpdateKanbanViewOptions";
import type { IColumn } from "@/types";
import CreateViewModalFooter from "@/pages/MainPage/components/CreateViewModal/CreateViewModalFooter";

interface IKanbanViewOptions {
	stackFieldId?: string | number | null;
	isEmptyStackHidden?: boolean;
}

interface UpdateKanbanViewModalProps {
	open: boolean;
	onClose: () => void;
	columns?: IColumn[];
	viewOptions?: IKanbanViewOptions | null;
	viewId: string;
	onSuccess?: (updatedView: any) => void;
}

function UpdateKanbanViewModal({
	open = false,
	onClose = () => {},
	columns = [],
	viewOptions,
	viewId,
	onSuccess,
}: UpdateKanbanViewModalProps) {
	// Show loading state until we have view options
	const isLoading = viewOptions === undefined || viewOptions === null;

	const { formHook, controls, stackingFieldOptions } = useUpdateViewSettings({
		columns,
	});
	const { assetId: baseId, tableId } = useDecodedUrlParams();
	const { updateKanbanViewOptions, loading } = useUpdateKanbanViewOptions();

	const {
		handleSubmit,
		control,
		formState: { errors },
		setValue,
	} = formHook;

	// Set form values when viewOptions become available (async operation)
	useEffect(() => {
		if (viewOptions && !isLoading) {
			const { stackFieldId = null, isEmptyStackHidden = false } = viewOptions;

			// Normalize stackingField value to match option types
			let normalizedStackingField: string | number | null = null;
			if (stackFieldId !== null && stackingFieldOptions.length > 0) {
				// Check if the value exists in options
				const valueExists = stackingFieldOptions.some(
					(opt: string | number) => String(opt) === String(stackFieldId)
				);

				if (valueExists) {
					// Find the matching option and use its exact type
					const matchingOption = stackingFieldOptions.find(
						(opt: string | number) => String(opt) === String(stackFieldId)
					);
					normalizedStackingField = matchingOption || null;
				}
			}

			// Set form values using setValue
			setValue("stackingField", normalizedStackingField);
			setValue("hideEmptyStack", isEmptyStackHidden);
		}
	}, [viewOptions, isLoading, stackingFieldOptions, setValue]);

	const handleSave = () => {
		handleSubmit(
			async (data: any) => {
				if (!baseId || !tableId) return;

				try {
					// Map form field names to backend field names
					const payload = {
						viewId,
						tableId,
						baseId,
						options: {
							stackFieldId: Number(data.stackingField),
							isEmptyStackHidden: data.hideEmptyStack || false,
						},
					};

					const updatedView = await updateKanbanViewOptions(payload);

					if (updatedView && onSuccess) {
						onSuccess(updatedView);
					}
					
					onClose();
				} catch (error) {
					// Error already handled in updateKanbanViewOptions hook
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
				isLoading ? (
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							minHeight: "200px",
						}}
					>
						<div
							style={{
								border: "3px solid rgba(0, 0, 0, 0.1)",
								borderLeftColor: "#212121",
								borderRadius: "50%",
								width: "40px",
								height: "40px",
								animation: "spin 1s linear infinite",
							}}
						/>
						<style>
							{`
								@keyframes spin {
									from { transform: rotate(0deg); }
									to { transform: rotate(360deg); }
								}
							`}
						</style>
					</div>
				) : (
					<form
						onKeyDown={handleKeyDown}
						onSubmit={(e) => e.preventDefault()}
					>
						<UpdateViewModalBody
							controls={controls}
							control={control}
							errors={errors}
						/>
					</form>
				)
			}
			dialogActions={
				!isLoading && (
					<CreateViewModalFooter
						onCancel={onClose}
						onSave={handleSave}
						loading={loading}
						saveButtonLabel="DONE"
					/>
				)
			}
			removeContentPadding={false}
		/>
	);
}

export default UpdateKanbanViewModal;

