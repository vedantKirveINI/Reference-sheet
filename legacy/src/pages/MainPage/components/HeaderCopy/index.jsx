import { useContext } from "react";

import { SheetsContext } from "../../../../context/SheetsContext";
import getAssetAccessDetails from "../../utils/getAssetAccessDetails";
import ShareModal from "../ShareModal";

import useHeader from "./hooks/useHeader";
import PrivateViewHeader from "./PrivateViewHeader";
import PublicViewHeader from "./PublicViewHeader";

function onHelpClick() {
	window.open("https://forum.tinycommand.com/");
}

function Header({ sheet = {}, setSheet = () => {} }) {
	const { assetAccessDetails, isMobile } = useContext(SheetsContext);
	const { isViewOnly } = getAssetAccessDetails(assetAccessDetails);

	const {
		name = "",
		saveSheetName = () => {},
		handleNameEdit = () => {},
		textFieldRef,
		show = false,
		showShare = false,
		setShowShare,
		onShareClick,
	} = useHeader({ sheet, setSheet });

	return (
		<>
			<header
				className="flex box-border py-3.5 px-8 items-center bg-white h-16 justify-between border-b border-[#e0e0e0] shadow-[0_1px_2px_rgba(0,0,0,0.04)] [&_input]:pl-1.5 max-[1599px]:h-14 max-[1599px]:py-3 max-[1599px]:px-6"
				data-testid="sheet-header"
			>
				{isViewOnly ? (
					<PublicViewHeader
						name={name}
						onHelpClick={onHelpClick}
						isMobile={isMobile}
					/>
				) : (
					<PrivateViewHeader
						name={name}
						handleNameEdit={handleNameEdit}
						saveSheetName={saveSheetName}
						textFieldRef={textFieldRef}
						show={show}
						onHelpClick={onHelpClick}
						onShareClick={onShareClick}
						isMobile={isMobile}
					/>
				)}
			</header>
			{showShare && (
				<ShareModal showShare={showShare} setShowShare={setShowShare} />
			)}
		</>
	);
}

export default Header;
