import { useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
} from "@/components/ui/dialog";
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

	useEffect(() => {
		if (viewOptions && !isLoading) {
			const { stackFieldId = null, isEmptyStackHidden = false } = viewOptions;

			let normalizedStackingField: string | number | null = null;
			if (stackFieldId !== null && stackingFieldOptions.length > 0) {
				const valueExists = stackingFieldOptions.some(
					(opt: string | number) => String(opt) === String(stackFieldId)
				);

				if (valueExists) {
					const matchingOption = stackingFieldOptions.find(
						(opt: string | number) => String(opt) === String(stackFieldId)
					);
					normalizedStackingField = matchingOption || null;
				}
			}

			setValue("stackingField", normalizedStackingField);
			setValue("hideEmptyStack", isEmptyStackHidden);
		}
	}, [viewOptions, isLoading, stackingFieldOptions, setValue]);

	const handleSave = () => {
		handleSubmit(
			async (data: any) => {
				if (!baseId || !tableId) return;

				try {
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
		<Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
			<DialogContent className="max-w-[480px]">
				{isLoading ? (
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
				)}
				{!isLoading && (
					<DialogFooter>
						<CreateViewModalFooter
							onCancel={onClose}
							onSave={handleSave}
							loading={loading}
							saveButtonLabel="DONE"
						/>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default UpdateKanbanViewModal;
