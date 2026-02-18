import ODSIcon from "@/lib/oute-icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, forwardRef } from "react";

const PublicViewTab = (
	{
		table = {},
		index,
		isActive = false,
		hideDivider = false,
		onClick = () => {},
	},
	ref,
) => {
	useEffect(() => {
		if (isActive) {
			ref.current?.scrollIntoView({
				behavior: "smooth",
				inline: "center",
			});
		}
	}, [isActive]);

	return (
		<div
			className={`box-border flex items-center ${isActive ? "self-stretch" : ""}`}
		>
			<div
				className={`text-white ${isActive ? "!bg-white !text-[#263238] py-1 px-4 rounded-md flex items-center mx-2" : ""}`}
				data-testid={`table-name-container-${index}`}
			>
				{isActive ? (
					<div className="min-w-12 max-w-[11rem] overflow-x-auto p-0.5 rounded border border-transparent [&::-webkit-scrollbar]:hidden">
						<div
							className="py-0.5 pl-1 pr-5 overflow-hidden text-ellipsis whitespace-nowrap inline-block text-sm outline-none"
							style={{
								maxWidth: "85%",
							}}
							data-testid="table-name-editor"
							ref={ref}
						>
							{table?.name || "Untitled Table"}
						</div>
					</div>
				) : (
					<div
						className="max-w-36 overflow-hidden text-ellipsis whitespace-nowrap text-white w-fit px-4 text-sm hover:cursor-pointer"
						onClick={(e) => {
							e.stopPropagation();
							onClick();
						}}
					>
						{table?.name || "Untitled Table"}
					</div>
				)}

				{isActive ? (
					<div className="flex items-center">
						{table?.description ? (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="mt-1">
											<ODSIcon outeIconName="OUTEInfoIcon" />
										</div>
									</TooltipTrigger>
									<TooltipContent side="right">
										<p>{table.description}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						) : null}
					</div>
				) : null}
			</div>

			{!isActive && !hideDivider ? (
				<div className="w-px h-6 bg-white/50" />
			) : null}
		</div>
	);
};

export default forwardRef(PublicViewTab);
