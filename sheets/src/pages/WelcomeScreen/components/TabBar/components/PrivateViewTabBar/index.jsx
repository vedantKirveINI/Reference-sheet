import ODSIcon from "oute-ds-icon";

import Tab from "../../../../../../components/TabBar";
import AddImport from "../../../AddImport";
import ExportData from "../../../ExportData";
import { getBoxShadow } from "../../utils/getBoxShadow";
import TableListPopover from "../TableListPopover";

import styles from "./styles.module.scss";

function PrivateViewTabBar({
	tableList = [],
	handleTabClick = () => {},
	scrollLeftMost = () => {},
	scrollRightMost = () => {},
	showLeftArrow = false,
	showRightArrow = false,
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
	return (
		<div className={styles.private_view_tab_bar_container}>
			<div className={styles.scrollable_container}>
				{showLeftArrow && (
					<div className={styles.left_arrow} onClick={scrollLeftMost}>
						<ODSIcon
							outeIconName={"OUTEChevronLeftIcon"}
							outeIconProps={{
								sx: {
									color: "#389B6A",
									width: "1.25rem",
									height: "1.25rem",
								},
							}}
						/>
					</div>
				)}

				{/* Scroll Wrapper to keep the tabs inside a bounded area */}
				<div
					className={styles.scroll_wrapper}
					style={{
						marginLeft: showLeftArrow ? "30px" : "0px",
						marginRight: showRightArrow ? "30px" : "0px",
						boxShadow: getBoxShadow({
							showRightArrow,
							showLeftArrow,
						}),
					}}
				>
					<nav
						className={styles.tablist_container}
						data-testid="tab-list"
						ref={tabListRef}
					>
						{tableList?.map((table, index) => (
							<Tab
								key={table?.id || index}
								table={table}
								index={index}
								isActive={tableId === table?.id}
								hideDivider={
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
								setTableList={setTableList}
							/>
						))}
					</nav>
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
									color: "#389B6A",
									width: "1.25rem",
									height: "1.25rem",
								},
							}}
						/>
					</div>
				)}
			</div>

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
						<ExportData
							viewId={viewId}
							tableId={tableId}
							baseId={assetId}
							tableListData={tableList}
						/>
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
		</div>
	);
}

export default PrivateViewTabBar;
