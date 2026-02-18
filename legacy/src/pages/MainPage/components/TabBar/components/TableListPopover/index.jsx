import isEmpty from "lodash/isEmpty";
import ODSIcon from "@/lib/oute-icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useRef, useEffect } from "react";

import truncateName from "../../../../../../utils/truncateName";

function TableListPopover({
	tableList = [],
	activeTableId = "",
	handleTabClick = () => {},
}) {
	const [showTableList, setShowTableList] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const selectedTableRef = useRef(null);

	const filteredTables = tableList.filter((table) =>
		table.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	useEffect(() => {
		if (showTableList && selectedTableRef.current) {
			selectedTableRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	}, [showTableList]);

	return (
		<Popover open={showTableList} onOpenChange={setShowTableList}>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<PopoverTrigger asChild>
							<div
								aria-label="TableExpand Icon"
								className="py-0.5 px-2 flex cursor-pointer"
								onClick={() => setShowTableList(true)}
							>
								<ODSIcon
									outeIconName={"OUTEExpandMoreIcon"}
									outeIconProps={{
										className: "text-black w-6 h-6",
									}}
								/>
							</div>
						</PopoverTrigger>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						<p>All Tables</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<PopoverContent
				className="z-[200] border border-[#e5e7eb] mt-3.5 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1),0_8px_24px_rgba(0,0,0,0.08),0_16px_48px_rgba(0,0,0,0.06)] p-0"
				align="end"
			>
				<div className="p-0 w-[23.25rem] bg-white">
					<div className="p-3 border-b border-[#e0e0e0]">
						<div className="flex items-center gap-2 px-2">
							<ODSIcon
								outeIconName={"OUTESearchIcon"}
								outeIconProps={{
									className: "text-[#90A4AE] w-4 h-4",
								}}
							/>
							<Input
								autoFocus={true}
								placeholder="Find a table"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="border-0 focus-visible:ring-0 text-base px-0"
							/>
						</div>
					</div>

					<div className="max-h-[18.6rem] overflow-y-auto py-1 px-3">
						{!isEmpty(filteredTables) ? (
							filteredTables.map((table, index) => {
								const isActive = activeTableId === table.id;
								return (
									<div
										key={table.id || index}
										ref={isActive ? selectedTableRef : null}
										className={`flex items-center py-2 pl-0 pr-4 cursor-pointer text-[#212121] bg-white rounded-md m-0 transition-colors duration-150 hover:bg-[#f5f5f5] ${
											isActive ? "text-[#212121] bg-white hover:bg-[#f5f5f5]" : ""
										}`}
										onClick={() => {
											handleTabClick({
												tableInfo: table,
											});
											setSearchQuery("");
											setShowTableList(false);
										}}
									>
										<div
											className="flex items-center justify-center min-w-8 flex-shrink-0"
										>
											{isActive && (
												<ODSIcon
													outeIconName={"CheckIcon"}
													outeIconProps={{
														className: "text-[#263238] w-5 h-5",
													}}
												/>
											)}
										</div>
										<span className="text-[13px] font-[Inter,sans-serif] font-normal text-[#212121] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
											{truncateName(table?.name, 45)}
										</span>
									</div>
								);
							})
						) : (
							<div className="p-[0.93rem] text-center">
								No tables found
							</div>
						)}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export default TableListPopover;
