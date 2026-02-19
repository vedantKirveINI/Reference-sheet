import ODSIcon from "oute-ds-icon";

import { getBoxShadow } from "../../utils/getBoxShadow";
import PublicViewTab from "../PublicViewTab";
import TableListPopover from "../TableListPopover";

import styles from "./styles.module.scss";

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
		<div className={styles.public_view_tab_bar_container}>
			<div className={styles.scrollable_container}>
				{showLeftArrow && (
					<div
						className={`${styles.arrow_container} ${styles.left_arrow}`}
						onClick={scrollLeftMost}
					>
						<ODSIcon
							outeIconName={"OUTEChevronLeftIcon"}
							outeIconProps={{
								sx: {
									color: "#389B6A",
									width: "1.5rem",
									height: "1.5rem",
								},
							}}
						/>
					</div>
				)}

				{/* Scroll Wrapper to keep the tabs inside a bounded area */}
				<div
					className={styles.scroll_wrapper}
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
						className={styles.tablist_container}
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
						className={`${styles.arrow_container} ${styles.right_arrow}`}
					>
						<ODSIcon
							outeIconName={"OUTEChevronRightIcon"}
							outeIconProps={{
								sx: {
									color: "#389B6A",
									width: "1.5rem",
									height: "1.5rem",
								},
							}}
						/>
					</div>
				)}
			</div>

			{(showRightArrow || showLeftArrow) && (
				<div className={styles.rest_tab_container}>
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
