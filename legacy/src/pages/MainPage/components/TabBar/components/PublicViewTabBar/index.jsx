import ODSIcon from "@/lib/oute-icon";

import { getBoxShadow } from "../../utils/getBoxShadow";
import PublicViewTab from "../PublicViewTab";
import TableListPopover from "../TableListPopover";

function PublicViewTabBar({
	tableList = [],
	handleTabClick = () => {},
	scrollLeftMost = () => {},
	scrollRightMost = () => {},
	showLeftArrow = false,
	showRightArrow = false,
	tabListRef = null,
	activeTabRef = null,
	tableId = "",
	setCord,
}) {
	return (
		<div className="bg-gradient-to-b from-[#dff5eb] via-[#d9f3e7] to-[#d4f0e2] flex items-center gap-2 px-3 h-16 max-[767px]:h-[50px] justify-between rounded-t-md border-t border-black/[0.08] border-b border-b-black/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
			<div className="w-[calc(100%-4rem)] h-full relative flex items-center">
				{showLeftArrow && (
					<div
						className="rounded-[0.4rem] bg-white absolute top-3 left-0 cursor-pointer py-[0.2rem] px-[0.15rem]"
						onClick={scrollLeftMost}
					>
						<ODSIcon
							outeIconName={"OUTEChevronLeftIcon"}
							outeIconProps={{
								className: "text-[#389B6A] w-6 h-6",
							}}
						/>
					</div>
				)}

				<div
					className="w-full overflow-hidden h-[inherit]"
					style={{
						marginLeft: showLeftArrow ? "36px" : "0px",
						marginRight: showRightArrow ? "56px" : "0px",
						boxShadow: getBoxShadow({
							showRightArrow,
							showLeftArrow,
						}),
					}}
				>
					<nav
						className="flex items-center overflow-x-scroll mt-2.5 scrollbar-none [&::-webkit-scrollbar]:hidden"
						data-testid="tab-list"
						ref={tabListRef}
					>
						{tableList?.map((table, index) => (
							<PublicViewTab
								key={table?.id || index}
								table={table}
								index={index}
								isActive={tableId === table?.id}
								hideDivider={
									tableId === table?.id ||
									tableId === tableList?.[index + 1]?.id ||
									index === tableList.length - 1
								}
								onClick={() =>
									handleTabClick({ tableInfo: table })
								}
								onTableSettingClick={(e) => {
									const rect =
										e.currentTarget.getBoundingClientRect();
									setCord({
										left: rect.left,
										top: rect.bottom + 8,
									});
								}}
								ref={activeTabRef}
							/>
						))}
					</nav>
				</div>

				{showRightArrow && (
					<div
						onClick={scrollRightMost}
						className="rounded-[0.4rem] bg-white absolute top-3 right-0 cursor-pointer py-[0.2rem] px-[0.15rem]"
					>
						<ODSIcon
							outeIconName={"OUTEChevronRightIcon"}
							outeIconProps={{
								className: "text-[#389B6A] w-6 h-6",
							}}
						/>
					</div>
				)}
			</div>

			{(showRightArrow || showLeftArrow) && (
				<div className="w-8 flex -mt-2 justify-center">
					<TableListPopover
						tableList={tableList}
						activeTableId={tableId}
						handleTabClick={handleTabClick}
					/>
				</div>
			)}
		</div>
	);
}

export default PublicViewTabBar;
