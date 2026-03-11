import Dashboard from "../Dashboard";
import Header from "../Header";
import TabBar from "../TabBar";

import tableListData from "./constant/tableListData";

function GetStarted({
	handleAIEnrichmentClick = () => {},
	handleBlankTableClick = () => {},
	createSheetLoading = false,
}) {
	return (
		<div>
			<Header />
			<TabBar tableList={tableListData} />
			<Dashboard
				handleAIEnrichmentClick={handleAIEnrichmentClick}
				handleBlankTableClick={handleBlankTableClick}
				createSheetLoading={createSheetLoading}
			/>
		</div>
	);
}

export default GetStarted;
