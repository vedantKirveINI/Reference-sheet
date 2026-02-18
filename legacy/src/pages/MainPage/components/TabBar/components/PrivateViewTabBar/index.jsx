import ODSIcon from "@/lib/oute-icon";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useCallback } from "react";
import { showAlert } from "@/lib/toast";

import AddImport from "../../../AddImport";
import { getBoxShadow } from "../../utils/getBoxShadow";
import TableListPopover from "../TableListPopover";
import useRequest from "../../../../../../hooks/useRequest";
import useDecodedUrlParams from "../../../../../../hooks/useDecodedUrlParams";

import Tab from "../../Tab";

function PrivateViewTabBar({
	tableList = [],
	handleTabClick = () => {},
	scrollLeftMost = () => {},
	scrollRightMost = () => {},
	showLeftArrow = false,
	showRightArrow = false,
	hasOverflow = false,
	tabListRef = null,
	activeTabRef = null,
	tableId = "",
	viewId = "",
	assetId = "",
	setCord,
	setTableList,
	setView,
	leaveRoom = () => {},
	isMobile,
}) {
	const { assetId: baseIdFromUrl } = useDecodedUrlParams();
	const effectiveBaseId = assetId || baseIdFromUrl;

	const [{}, updateOrderTrigger] = useRequest(
		{
			method: "put",
			url: "/table/update_tables",
		},
		{ manual: true },
	);

	const handleDragEnd = useCallback(
		async (result) => {
			if (
				!result.destination ||
				result.source.index === result.destination.index
			) {
				return;
			}

			const sourceIndex = result.source.index;
			const destIndex = result.destination.index;

			const newTableList = Array.from(tableList);
			const [reorderedItem] = newTableList.splice(sourceIndex, 1);
			newTableList.splice(destIndex, 0, reorderedItem);

			let newOrder;
			const leftNeighbor = newTableList[destIndex - 1];
			const rightNeighbor = newTableList[destIndex + 1];

			if (leftNeighbor && rightNeighbor) {
				newOrder = (leftNeighbor.order + rightNeighbor.order) / 2;
			} else if (leftNeighbor) {
				newOrder = leftNeighbor.order + 1;
			} else if (rightNeighbor) {
				newOrder = Math.max(0, rightNeighbor.order - 1);
			} else {
				newOrder = reorderedItem.order || 1;
			}

			const updatedTables = newTableList.map((table, index) => {
				if (table.id === reorderedItem.id) {
					return { ...table, order: newOrder };
				}
				return table;
			});

			if (setTableList) {
				setTableList(updatedTables);
			}

			try {
				await updateOrderTrigger({
					data: {
						baseId: effectiveBaseId,
						whereObj: { id: [reorderedItem.id] },
						updateObj: { order: newOrder },
					},
				});
			} catch (error) {
				if (setTableList) {
					setTableList(tableList);
				}
				showAlert({
					type: "error",
					message: "Failed to update table order. Please try again.",
				});
			}
		},
		[tableList, setTableList, effectiveBaseId, updateOrderTrigger],
	);

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<div
				className={`bg-gradient-to-b from-[#dff5eb] via-[#d9f3e7] to-[#d4f0e2] flex items-center gap-3 px-6 h-9 max-[1599px]:h-8 justify-between border-t border-black/[0.08] border-b border-b-black/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ${hasOverflow ? "[&_.rest-tab-container]:flex-[0_0_auto] [&_.rest-tab-container]:w-28 [&_.rest-tab-container]:min-w-28" : ""}`}
			>
				<div className="flex-1 min-w-0 h-full relative flex items-center overflow-visible">
					{showLeftArrow && (
						<div
							className="rounded-full bg-[rgba(56,155,106,0.65)] absolute left-1 top-1/2 -translate-y-1/2 cursor-pointer p-[0.3rem] z-10 flex items-center justify-center shadow-[0_1px_4px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)] transition-[background-color,box-shadow] duration-200 w-7 h-7 hover:bg-[rgba(56,155,106,0.8)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
							onClick={scrollLeftMost}
						>
							<ODSIcon
								outeIconName={"OUTEChevronLeftIcon"}
								outeIconProps={{
									size: 20,
									className: "text-white",
								}}
							/>
						</div>
					)}

					<div
						className="w-full overflow-hidden h-[inherit] relative"
						style={{
							marginLeft: showLeftArrow ? "44px" : "0px",
							marginRight: showRightArrow ? "44px" : "0px",
							boxShadow: getBoxShadow({
								showRightArrow,
								showLeftArrow,
							}),
						}}
					>
						<Droppable droppableId="tabs" direction="horizontal">
							{(provided, snapshot) => (
								<nav
									ref={(el) => {
										provided.innerRef(el);
										if (
											tabListRef &&
											typeof tabListRef === "object" &&
											"current" in tabListRef
										) {
											tabListRef.current = el;
										}
									}}
									{...provided.droppableProps}
									className={`flex items-center overflow-x-scroll h-full gap-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden ${snapshot.isDraggingOver ? "bg-[rgba(56,155,106,0.05)]" : ""}`}
									data-testid="tab-list"
								>
									{tableList?.map((table, index) => {
										const isActive = tableId === table?.id;
										const isLastTab =
											index === tableList.length - 1;
										const hideDivider =
											isActive ||
											tableId ===
												tableList?.[index + 1]?.id ||
											isLastTab;

										return (
											<Draggable
												key={
													table?.id ||
													`table-${index}`
												}
												draggableId={String(
													table?.id ||
														`table-${index}`,
												)}
												index={index}
											>
												{(provided, snapshot) => (
													<div
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
														className={`h-full self-stretch flex items-center ${snapshot.isDragging ? "opacity-90 shadow-[0_4px_12px_rgba(0,0,0,0.18)] z-[1000]" : ""}`}
													>
														<Tab
															table={table}
															index={index}
															isActive={isActive}
															hideDivider={
																hideDivider
															}
															onClick={() =>
																handleTabClick({
																	tableInfo:
																		table,
																})
															}
															onTableSettingClick={(
																e,
															) => {
																const rect =
																	e.currentTarget.getBoundingClientRect();
																setCord({
																	left: rect.right,
																	top:
																		rect.bottom +
																		8,
																});
															}}
															ref={
																isActive
																	? activeTabRef
																	: null
															}
															setTableList={
																setTableList
															}
														/>
													</div>
												)}
											</Draggable>
										);
									})}
									{!hasOverflow && !isMobile && (
										<div
											className="flex items-center h-full flex-shrink-0 gap-1"
											data-testid="add-table-inline"
										>
											<div className="w-[0.75px] bg-black/[0.15] h-5" />
											<AddImport
												baseId={assetId}
												setView={setView}
												leaveRoom={leaveRoom}
												tableList={tableList}
											/>
										</div>
									)}
									{provided.placeholder}
								</nav>
							)}
						</Droppable>
					</div>

					{showRightArrow && (
						<div
							onClick={scrollRightMost}
							className="rounded-full bg-[rgba(56,155,106,0.65)] absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer p-[0.3rem] z-10 flex items-center justify-center shadow-[0_1px_4px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)] transition-[background-color,box-shadow] duration-200 w-7 h-7 hover:bg-[rgba(56,155,106,0.8)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
						>
							<ODSIcon
								outeIconName={"OUTEChevronRightIcon"}
								outeIconProps={{
									size: 20,
									className: "text-white",
								}}
							/>
						</div>
					)}
				</div>

				{hasOverflow && (
					<div className="rest-tab-container flex items-center h-full gap-1">
						{(showRightArrow || showLeftArrow) && (
							<TableListPopover
								tableList={tableList}
								activeTableId={tableId}
								handleTabClick={handleTabClick}
							/>
						)}
						{!isMobile && (
							<>
								<div className="w-[0.75px] bg-black/[0.15] h-5" />
								<AddImport
									baseId={assetId}
									setView={setView}
									leaveRoom={leaveRoom}
									tableList={tableList}
								/>
							</>
						)}
					</div>
				)}
			</div>
		</DragDropContext>
	);
}

export default PrivateViewTabBar;
