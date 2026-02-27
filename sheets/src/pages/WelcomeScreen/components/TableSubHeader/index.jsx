import { forwardRef, useContext } from "react";

import Filter from "../../../../components/Filter";
import Sort from "../../../../components/Sort";
// import HideFields from "../../../../components/HideFields";
// import Group from "../../../../components/Group";
// import Color from "../../../../components/Color";
// import RowSize from "../../../../components/RowSize";
// import Search from "../../../../components/Search";
import TableSubHeaderSkeleton from "../../../../components/TableSubHeaderSkeleton";
import TextWrapper from "../../../../components/TextWrapper";
import Zoom from "../../../../components/Zoom";
import { SheetsContext } from "../../../../context/sheetsContext";
import getAssetAccessDetails from "../../utils/getAssetAccessDetails";

import styles from "./styles.module.scss";

function TableSubHeader(
	{
		view = {},
		getViewsLoading = false,
		textWrapped = {},
		setTextWrapped,
		socket = {},
		setView,
		zoomLevel = 100,
		setZoomLevel,
	},
	hotTableRef,
) {
	const { filter = {}, sort = {}, fields = [], columnMeta = "" } = view || {};

	const { assetAccessDetails } = useContext(SheetsContext);
	const { isViewOnly } = getAssetAccessDetails(assetAccessDetails);

	if (isViewOnly) {
		return null;
	}

	if (getViewsLoading) {
		return <TableSubHeaderSkeleton />;
	}

	return (
		<div className={styles.tableSubHeaderContainer}>
			<div className={styles.tableSubHeaders}>
				{/* <HideFields /> */}

				<Filter filter={filter} fields={fields} />

				{/* <Group /> */}

				<Sort sort={sort} fields={fields} />

				{/* <Color /> */}

				{/* <RowSize /> */}

				<TextWrapper
					ref={hotTableRef}
					fields={fields}
					textWrapped={textWrapped}
					setTextWrapped={setTextWrapped}
					socket={socket}
					setView={setView}
					columnMeta={columnMeta}
				/>

				<Zoom zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
			</div>
			{/* <div className={styles.searchButton}>
				<Search />
			</div> */}
		</div>
	);
}

export default forwardRef(TableSubHeader);
