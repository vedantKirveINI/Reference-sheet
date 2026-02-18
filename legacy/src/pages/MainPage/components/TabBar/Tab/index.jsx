import ODSIcon from "@/lib/oute-icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, forwardRef } from "react";

const TabBar = (
	{
		table = {},
		index,
		isActive = false,
		hideDivider = false,
		onClick = () => {},
		onTableSettingClick,
	},
	ref,
) => {
	useEffect(() => {
		if (isActive && ref && ref.current) {
			ref.current.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "center",
			});
		}
	}, [isActive, ref]);

	return (
		<div
			className={`box-border flex items-center gap-0.5 ${isActive ? "self-stretch" : ""}`}
			ref={isActive && ref ? ref : null}
		>
			<div
				className={`text-black/75 transition-all duration-200 font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] ${isActive ? "bg-white text-[#1a1a1a] py-1.5 px-3 rounded-t-lg border-l border-r border-black/[0.12] border-t-0 border-b-0 flex items-center m-0 relative self-stretch h-full min-w-[80px] max-w-[200px] overflow-hidden gap-1 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]" : ""}`}
				data-testid={`table-name-container-${index}`}
			>
				<div className="max-w-[180px] flex-1 min-w-0 overflow-hidden flex items-center [&>*]:min-w-0 [&>*]:max-w-full [&>*]:overflow-hidden">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div
									className={`overflow-hidden text-ellipsis whitespace-nowrap text-black/[0.78] w-full min-w-0 max-w-full py-1.5 px-3 bg-transparent rounded-t-lg transition-all duration-200 block box-border text-[0.9375rem] font-medium tracking-[-0.01em] hover:cursor-pointer hover:bg-white/50 focus-visible:outline-2 focus-visible:outline-[rgba(56,155,106,0.8)] focus-visible:outline-offset-2 ${isActive ? "!text-[#1a1a1a] !bg-transparent !p-0 !font-semibold" : ""}`}
									role="button"
									tabIndex={0}
									onClick={(e) => {
										e.stopPropagation();
										onClick();
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											onClick();
										}
									}}
								>
									{table?.name || "Untitled Table"}
								</div>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>{table?.name || "Untitled Table"}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				{isActive && (
					<div className="gap-1 flex-shrink-0 h-full pl-0 flex items-center">
						{table?.description ? (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center justify-center">
											<ODSIcon
												outeIconName="OUTEInfoIcon"
												outeIconProps={{
													className: "text-[#212121] w-5 h-5",
												}}
											/>
										</div>
									</TooltipTrigger>
									<TooltipContent side="right">
										<p>{table.description}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						) : null}

						<span
							className="cursor-pointer pt-1"
							onClick={onTableSettingClick}
						>
							<ODSIcon
								outeIconName="OUTEExpandMoreIcon"
								outeIconProps={{
									className: "text-[#212121] w-5 h-5",
								}}
							/>
						</span>
					</div>
				)}
			</div>

			{!isActive && !hideDivider ? (
				<div className="w-[0.047rem] h-4 bg-black/[0.18]" />
			) : null}
		</div>
	);
};

export default forwardRef(TabBar);
