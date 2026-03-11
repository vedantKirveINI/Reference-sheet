import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";

import { RANKING_ICON } from "../../../../../../../../constants/Icons/questionTypeIcons";

import styles from "./styles.module.scss";

const Header = ({ title = "" }) => {
	return (
		<div
			className={styles.header_container}
			data-testid="dialog-ranking-header"
		>
			<ODSIcon
				imageProps={{
					src: RANKING_ICON,
					className: styles.ranking_icon,
				}}
			/>
			<ODSLabel sx={{ fontFamily: "Inter", fontWeight: "400" }}>
				{title}
			</ODSLabel>
		</div>
	);
};

export default Header;
