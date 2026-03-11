import isEmpty from "lodash/isEmpty";

import NoAccessEmptyState from "../../components/NoAccessEmptyState";
import SheetSkeleton from "../../components/SheetSkeleton";
import getSocketInstance from "../../websocket/client";

import BinModal from "./components/BinModal";
import GetStarted from "./components/GetStarted";
import HandsOnTable from "./components/Handsontable";
import Header from "./components/Header";
import TabBar from "./components/TabBar";
import TableSubHeader from "./components/TableSubHeader";
import useHandsontable from "./hooks/useHandsontable";
import styles from "./styles.module.scss";

function WelcomeScreen() {
	const socket = getSocketInstance();

	const {
		view = {},
		setView,
		sheet = {},
		leaveRoom = () => {},
		tableList = [],
		handleTabClick = () => {},
		checkedRowsRef,
		setSheet,
		setTableList,
		getViews,
		getViewsLoading,
		hotTableRef,
		textWrapped,
		setTextWrapped,
		hasAccess = false,
		isViewOnly = false,
		zoomLevel = 100,
		setZoomLevel,
		isInTrash = false,
		handleAIEnrichmentClick = () => {},
		handleBlankTableClick = () => {},
		assetId = "",
		createSheetLoading = false,
	} = useHandsontable({ socket });

	// Added check on permissions status to avoid showing empty state when permissions are still loading
	if (!hasAccess) {
		return <NoAccessEmptyState />;
	}

	if (!assetId) {
		return (
			<GetStarted
				handleAIEnrichmentClick={handleAIEnrichmentClick}
				handleBlankTableClick={handleBlankTableClick}
				createSheetLoading={createSheetLoading}
			/>
		);
	}

	if (isEmpty(tableList)) {
		return <SheetSkeleton />;
	}

	return (
		<div className={styles.tiny_tables_container}>
			{!isEmpty(sheet) && <Header sheet={sheet} setSheet={setSheet} />}

			<div className={`${isViewOnly ? styles.tiny_table_content : ""}`}>
				<TabBar
					tableList={tableList}
					handleTabClick={handleTabClick}
					setView={setView}
					leaveRoom={leaveRoom}
					setTableList={setTableList}
				/>

				<TableSubHeader
					view={view}
					getViewsLoading={getViewsLoading}
					textWrapped={textWrapped}
					setTextWrapped={setTextWrapped}
					ref={hotTableRef}
					setView={setView}
					socket={socket}
					zoomLevel={zoomLevel}
					setZoomLevel={setZoomLevel}
				/>

				<HandsOnTable
					socket={socket}
					view={view}
					setView={setView}
					getViews={getViews}
					checkedRowsRef={checkedRowsRef}
					textWrapped={textWrapped}
					setTextWrapped={setTextWrapped}
					ref={hotTableRef}
					zoomLevel={zoomLevel}
					setZoomLevel={setZoomLevel}
				/>
			</div>
			{Boolean(isInTrash) && <BinModal sheet={sheet} />}
		</div>
	);
}

export default WelcomeScreen;
