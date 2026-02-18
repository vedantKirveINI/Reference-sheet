import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function DialogActions({
	onPrevious,
	primaryAction = () => {},
	secondaryAction = () => {},
	primaryLabel = "IMPORT",
	secondaryLabel = "CANCEL",
	backLabel = "",
	disableSubmit = false,
	loading = false,
	primaryButtonProps = {},
	secondaryButtonProps = {},
}) {
	const { sx: secondarySx, startIcon: secondaryStartIcon, ...restSecondaryProps } =
		secondaryButtonProps || {};
	const { sx: primarySx, ...restPrimaryProps } = primaryButtonProps || {};

	return (
		<div className="flex justify-between items-center w-full pl-4 pr-6">
			<div className="flex items-center">
				{backLabel && onPrevious ? (
					<Button
						variant="outline"
						disabled={loading}
						onClick={onPrevious}
						className="text-sm font-medium px-4 py-[7px] rounded-md normal-case"
					>
						{backLabel}
					</Button>
				) : (
					<div />
				)}
			</div>

			<div className="flex gap-6">
				<Button
					variant="outline"
					onClick={secondaryAction}
					disabled={loading}
					className="text-sm font-medium px-4 py-[7px] rounded-md normal-case"
					{...restSecondaryProps}
				>
					{secondaryStartIcon}
					{secondaryLabel}
				</Button>
				<Button
					variant="default"
					disabled={disableSubmit || loading}
					onClick={primaryAction}
					className="text-sm font-medium px-4 py-[7px] rounded-md normal-case"
					{...restPrimaryProps}
				>
					{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{primaryLabel}
				</Button>
			</div>
		</div>
	);
}

export default DialogActions;
