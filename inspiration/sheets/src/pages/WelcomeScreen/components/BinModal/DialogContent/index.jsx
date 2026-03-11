import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";

import BIN_ICON from "../../../../../constants/Icons/binIcon";

import styles from "./styles.module.scss";

function DialogContent({ sheet = {} }) {
	return (
		<div className={styles.dialog_content_container}>
			<ODSIcon
				imageProps={{
					src: BIN_ICON,
					className: styles.bin_icon,
				}}
			/>
			<ODSLabel
				variant="h5"
				sx={{
					fontFamily: "Inter",
					fontWeight: "700",
				}}
				color="#000"
			>
				"{sheet.name || "Untitled Sheet"}" is in bin
			</ODSLabel>
			<ODSLabel
				variant="subtitle1"
				color="#607D8B"
				sx={{
					fontFamily: "Inter",
				}}
			>
				To edit or share the table, please remove it from trash first.
				If you don’t own this table, contact the owner to restore it.
			</ODSLabel>
		</div>
	);
}

export default DialogContent;
