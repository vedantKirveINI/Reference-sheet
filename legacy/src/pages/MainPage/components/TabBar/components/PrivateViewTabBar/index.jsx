import ODSIcon from "oute-ds-icon";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useCallback } from "react";
import { showAlert } from "oute-ds-alert";

import AddImport from "../../../AddImport";
import { getBoxShadow } from "../../utils/getBoxShadow";
import TableListPopover from "../TableListPopover";
import useRequest from "../../../../../../hooks/useRequest";
import useDecodedUrlParams from "../../../../../../hooks/useDecodedUrlParams";

import styles from "./styles.module.scss";
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

	// API hook for updating table order
	const [{}, updateOrderTrigger] = useRequest(
		{
			method: "put",
			url: "/table/update_tables",
		},
		{ manual: true },
	);

	/**
	 * Handles drag end event and updates table order
	 * Only updates the moved table - calculates order from neighbors
	 * @param {Object} result - Drag result from react-beautiful-dnd
	 */
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

			// Create reordered array for local state
			const newTableList = Array.from(tableList);
			const [reorderedItem] = newTableList.splice(sourceIndex, 1);
			newTableList.splice(destIndex, 0, reorderedItem);

			// Calculate new order based on neighbors
			let newOrder;
			const leftNeighbor = newTableList[destIndex - 1];
			const rightNeighbor = newTableList[destIndex + 1];

			if (leftNeighbor && rightNeighbor) {
				// Between two tables: average of left and right orders
				newOrder = (leftNeighbor.order + rightNeighbor.order) / 2;
			} else if (leftNeighbor) {
				// At the end: order after the left neighbor
				newOrder = leftNeighbor.order + 1;
			} else if (rightNeighbor) {
				// At the beginning: order before the right neighbor
				newOrder = Math.max(0, rightNeighbor.order - 1);
			} else {
				// Only one table: keep existing order or set to 1
				newOrder = reorderedItem.order || 1;
			}

			// Update local state immediately for instant feedback
			const updatedTables = newTableList.map((table, index) => {
				if (table.id === reorderedItem.id) {
					return { ...table, order: newOrder };
				}
				return table;
			});

			if (setTableList) {
				setTableList(updatedTables);
			}

			// Update only the moved table in backend
			try {
				await updateOrderTrigger({
					data: {
						baseId: effectiveBaseId,
						whereObj: { id: [reorderedItem.id] },
						updateObj: { order: newOrder },
					},
				});
			} catch (error) {
				// Revert to original order on error
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
				className={`${styles.private_view_tab_bar_container} ${hasOverflow ? styles.has_overflow : ""}`}
			>
				<div className={styles.scrollable_container}>
					{showLeftArrow && (
						<div
							className={styles.left_arrow}
							onClick={scrollLeftMost}
						>
							<ODSIcon
								outeIconName={"OUTEChevronLeftIcon"}
								outeIconProps={{
									sx: {
										color: "#fff",
										width: "1.25rem",
										height: "1.25rem",
									},
								}}
							/>
						</div>
					)}

					<div
						className={styles.scroll_wrapper}
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
									className={`${styles.tablist_container} ${snapshot.isDraggingOver ? styles.drag_over : ""}`}
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
														className={`${styles.tab_draggable_wrapper} ${snapshot.isDragging ? styles.dragging_tab : ""}`}
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
											className={
												styles.add_inline_wrapper
											}
											data-testid="add-table-inline"
										>
											<div className={styles.divider} />
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
							className={styles.right_arrow}
						>
							<ODSIcon
								outeIconName={"OUTEChevronRightIcon"}
								outeIconProps={{
									sx: {
										color: "#fff",
										width: "1.25rem",
										height: "1.25rem",
									},
								}}
							/>
						</div>
					)}
				</div>

				{hasOverflow && (
					<div className={styles.rest_tab_container}>
						{(showRightArrow || showLeftArrow) && (
							<TableListPopover
								tableList={tableList}
								activeTableId={tableId}
								handleTabClick={handleTabClick}
							/>
						)}
						{!isMobile && (
							<>
								<div className={styles.divider} />
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
