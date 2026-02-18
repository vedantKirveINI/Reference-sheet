import React from "react";
import { Signature } from "@oute/oute-ds.molecule.signature";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import Header from "./Header";
import useSignatureFieldHandler from "./hooks/useSignatureFieldHandler";

export const SignatureFieldEditor: React.FC<IFieldEditorProps> = ({
	field,
	value,
	onChange,
	readonly = false,
}) => {
	const { name: fieldName = "" } = field || {};

	const {
		open,
		signatureImage,
		loading,
		signatureRef,
		handleClick,
		handleClose,
		handleSignatureChange,
		handleSave,
	} = useSignatureFieldHandler({ value, onChange, readonly });

	return (
		<div className="w-full h-full" data-testid="signature-expanded-row">
			{value ? (
				<div className="relative bg-white border border-[#cfd8dc] rounded-xl p-2.5 flex justify-center">
					<img
						src={value as string}
						alt="Signature"
						className="max-w-[60%]"
					/>
					{!readonly && (
						<button
							className="absolute bottom-3 right-0 bg-transparent border-none text-[#212121] text-center font-[Inter] text-base underline cursor-pointer hover:bg-white"
							onClick={handleClick}
						>
							EDIT SIGNATURE
						</button>
					)}
				</div>
			) : (
				!readonly && (
					<Button variant="outline" onClick={handleClick}>
						ADD SIGNATURE
					</Button>
				)
			)}

			<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
				<DialogContent className="max-w-[35rem] p-0" onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}>
					<DialogHeader className="p-4 pb-0">
						<DialogTitle asChild>
							<Header title={fieldName} />
						</DialogTitle>
					</DialogHeader>
					<div className="px-6 py-8">
						<span className="text-sm text-[#607D8B] font-[Inter]">
							Please sign in the designated area below, ensuring
							your signature stays within the boundaries.
						</span>
						<div className="mt-5">
							<Signature
								ref={signatureRef}
								value={signatureImage}
								onChange={handleSignatureChange}
								canvasProps={{
									style: {
										width: "30.625rem",
										height: "15rem",
										border: "0.047rem solid rgba(0, 0, 0, 0.20)",
										borderRadius: "0.75rem",
									},
									"data-testid": "signature-canvas",
								}}
							/>
						</div>
					</div>
					<DialogFooter className="p-4 pt-0">
						<div className="flex items-center p-1 gap-6">
							<Button
								variant="outline"
								onClick={handleClose}
								disabled={loading}
							>
								DISCARD
							</Button>
							<Button
								variant="default"
								onClick={handleSave}
								disabled={loading}
							>
								{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								SAVE
							</Button>
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
