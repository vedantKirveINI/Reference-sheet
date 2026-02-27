import { useContext } from "react";

import { SheetsContext } from "../../../../context/sheetsContext";
import getAssetAccessDetails from "../../utils/getAssetAccessDetails";
import onHelpClick from "../../utils/onHelpClick";
import ShareModal from "../ShareModal";

import useHeader from "./hooks/useHeader";
import PrivateViewHeader from "./PrivateViewHeader";
import PublicViewHeader from "./PublicViewHeader";
import styles from "./styles.module.scss";

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
				className={styles.header_container}
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
