import { Button } from "@/components/ui/button";
import ODSIcon from "@/lib/oute-icon";
import { Input } from "@/components/ui/input";

function PrivateViewHeader({
	name = "",
	handleNameEdit = () => {},
	saveSheetName = () => {},
	textFieldRef = null,
	show = () => {},
	onHelpClick = () => {},
	onShareClick = () => {},
	isMobile = false,
}) {
	return (
		<>
			<div className="min-w-fit flex items-center gap-3 flex-1">
				<ODSIcon
					outeIconName="TINYSheetIcon"
					outeIconProps={{
						className: "w-8 h-8",
						"aria-label": "TINYTable Logo",
					}}
				/>

				<Input
					data-testid="sheet-title-input"
					aria-label="Sheet Name"
					className="border-0 px-3 py-2 hover:bg-[#f5f5f5] focus:bg-[#fafafa] text-lg font-semibold overflow-hidden text-ellipsis text-[#212121] tracking-tight"
					style={{
						width: `${name?.length + 1}ch`,
						minWidth: "16ch",
						maxWidth: isMobile ? "30rem" : "44.875rem",
					}}
					value={name}
					onChange={handleNameEdit}
					onBlur={() => {
						saveSheetName();
					}}
					ref={textFieldRef}
				/>
			</div>

			<nav className="flex items-center flex-shrink-0">
				<ul className="flex items-center list-none p-0 m-0 gap-2">
					{!isMobile && (
						<>
							<li>
								<ODSIcon
									outeIconName="OUTESupportAgentIcon"
									outeIconProps={{
										className: "w-6 h-6 text-[#666666] transition-colors duration-200",
									}}
									buttonProps={{
										className: "p-2 rounded-lg hover:bg-[#f5f5f5]",
									}}
									onClick={() => {
										show();
									}}
								/>
							</li>
							<li>
								<Button
									variant="ghost"
									aria-label="Help"
									className="gap-2 text-sm font-medium px-3 py-2 rounded-lg normal-case hover:bg-[#f5f5f5]"
									onClick={onHelpClick}
								>
									<ODSIcon
										outeIconName="OUTEHelpIcon"
										outeIconProps={{
											className: "text-[#666666] w-5 h-5",
										}}
									/>
									Help
								</Button>
							</li>
							<li>
								<Button
									aria-label="Share"
									data-testid="share-button"
									className="text-sm font-semibold px-5 py-2.5 rounded-md normal-case text-white shadow-[0_2px_4px_rgba(56,155,106,0.3)] transition-all duration-200 hover:shadow-[0_4px_8px_rgba(56,155,106,0.4)] hover:-translate-y-px active:translate-y-0 active:shadow-[0_2px_4px_rgba(56,155,106,0.3)]"
									style={{
										background: "linear-gradient(90deg, #389b6a 3%)",
									}}
									onClick={onShareClick}
								>
									SHARE
								</Button>
							</li>
						</>
					)}
				</ul>
			</nav>
		</>
	);
}

export default PrivateViewHeader;
