import { Button } from "@/components/ui/button";
import ODSIcon from "@/lib/oute-icon";

function PublicViewHeader({
	name = "",
	onHelpClick = () => {},
	isMobile = false,
}) {
	return (
		<>
			<div className="min-w-fit flex items-center gap-4">
				<ODSIcon
					outeIconName="TINYSheetIcon"
					outeIconProps={{
						className: "w-9 h-9",
						"aria-label": "TINYTable Logo",
					}}
				/>

				<span
					className="font-inter font-normal overflow-hidden text-ellipsis whitespace-nowrap w-full text-xl"
					style={{
						maxWidth: isMobile ? "20rem" : "44.875rem",
					}}
				>
					{name}
				</span>
			</div>

			<nav className="flex items-center">
				<ul className="flex items-center list-none p-0 m-0 gap-6">
					<li>
						<Button
							variant="default"
							className="bg-[#ECEFF1] text-[#212121] font-normal font-inter text-sm hover:bg-[#ECEFF1]"
						>
							<ODSIcon
								outeIconName="OUTEInfoIcon"
								outeIconProps={{
									className: "text-[#212121] w-6 h-6",
								}}
							/>
							View only
						</Button>
					</li>
					<li>
						<Button
							variant="ghost"
							aria-label="Help"
							className="gap-3 text-sm"
							onClick={onHelpClick}
						>
							<ODSIcon
								outeIconName="OUTEHelpIcon"
								outeIconProps={{
									className: "text-[#212121] w-6 h-6",
								}}
							/>
							HELP
						</Button>
					</li>
				</ul>
			</nav>
		</>
	);
}

export default PublicViewHeader;
