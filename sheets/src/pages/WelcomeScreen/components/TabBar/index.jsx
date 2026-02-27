import ODSContextMenu from "oute-ds-context-menu";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

import { SheetsContext } from "../../../../context/sheetsContext";
import useDecodedUrlParams from "../../../../hooks/useDecodedUrlParams";
import getAssetAccessDetails from "../../utils/getAssetAccessDetails";
import ImportCSV from "../AddImport/ImportCSV";

import PrivateViewTabBar from "./components/PrivateViewTabBar";
import PublicViewTabBar from "./components/PublicViewTabBar";
import WarningModal from "./components/WarningModal";
import { tableSetting } from "./configuration/tableSetting";
import useTabBar from "./hook/useTabBar";

function TabBar({
	tableList = [],
	handleTabClick = () => {},
	setView = () => {},
	leaveRoom = () => {},
	setTableList = () => {},
}) {
	const { assetAccessDetails, isMobile } = useContext(SheetsContext);
	const { isViewOnly } = getAssetAccessDetails(assetAccessDetails);

	const [cord, setCord] = useState(null);
	const [showLeftArrow, setShowLeftArrow] = useState(false);
	const [showRightArrow, setShowRightArrow] = useState(false);

	const tabListRef = useRef();

	const { tableId, viewId, assetId } = useDecodedUrlParams();

	const {
		onSubmit,
		loading,
		tableContextMenu,
		setTableContextMenu,
		activeTabRef,
		checkScroll,
	} = useTabBar({
		tableList,
		handleTabClick,
		setShowLeftArrow,
		setShowRightArrow,
		tabListRef,
	});

	const scrollLeftMost = () => {
		if (tabListRef.current) {
			tabListRef.current.scrollTo({ left: 0, behavior: "smooth" });
		}
	};

	const scrollRightMost = () => {
		if (tabListRef.current) {
			const { scrollWidth, clientWidth } = tabListRef.current;

			// Scroll to the maximum possible left position
			tabListRef.current.scrollTo({
				left: scrollWidth - clientWidth,
				behavior: "smooth",
			});
		}
	};

	// Context Menu Items
	const menus = useMemo(() => {
		return tableSetting.reduce((acc, config, index) => {
			const { name, label, iconName } = config;

			if (tableList.length === 1 && name === "deleteTable") {
				return acc;
			}

			return [
				...acc,
				{
					id: index + 1,
					name: (
						<ODSLabel
							variant="subtitle1"
							sx={{ fontFamily: "Inter", fontWeight: "400" }}
							color="#263238"
						>
							{label}
						</ODSLabel>
					),
					onClick: () => {
						setTableContextMenu(name);
					},
					leftAdornment: (
						<ODSIcon
							outeIconName={iconName}
							outeIconProps={{
								sx: {
									width: "1.125rem",
									height: "1.125rem",
									cursor: "pointer",
									color: "#90A4AE",
								},
							}}
						/>
					),
				},
			];
		}, []);
	}, [setTableContextMenu, tableList]);

	// Function to check if the leftmost and rightmost elements are visible

	// Attach scroll event listener
	useEffect(() => {
		const tabListElement = tabListRef.current;
		if (!tabListElement) return;

		checkScroll();
		tabListElement.addEventListener("scroll", checkScroll);

		return () => {
			tabListElement.removeEventListener("scroll", checkScroll);
		};
	}, [tableList]);

	const commonProps = {
		tableList,
		handleTabClick,
		scrollLeftMost,
		scrollRightMost,
		showLeftArrow,
		showRightArrow,
		tabListRef,
		activeTabRef,
		tableId,
		viewId,
		assetId,
		setCord,
		setTableList,
	};

	return (
		<>
			{isViewOnly ? (
				<PublicViewTabBar {...commonProps} />
			) : (
				<PrivateViewTabBar
					{...commonProps}
					setView={setView}
					leaveRoom={leaveRoom}
					isMobile={isMobile}
				/>
			)}

			<ODSContextMenu
				coordinates={cord}
				show={!!cord}
				onClose={() => {
					setCord(null);
				}}
				menus={menus}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
			/>

			{tableContextMenu === "importTable" && (
				<ImportCSV
					open={"importTable"}
					selectedTableIdWithViewId={{ tableId, viewId }}
					setOpen={setTableContextMenu}
				/>
			)}

			<WarningModal
				open={tableContextMenu}
				setOpen={setTableContextMenu}
				loading={loading}
				onSubmit={onSubmit}
			/>
		</>
	);
}

export default TabBar;
