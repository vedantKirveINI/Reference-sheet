import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";

import { TINY_TABLES_ICON } from "../../constants/Icons/commonIcons";

import styles from "./styles.module.scss";

// inTrash check not added yet, will be used in future scope
function NoAccessEmptyState() {
	return (
		<div className={styles.container} data-testid="no-access-empty-state">
			<ODSIcon
				imageProps={{
					src: TINY_TABLES_ICON,
					className: styles.img,
				}}
			/>
			{/* {isInTrash ? (
				<ODSLabel
					variant="h5"
					sx={{
						fontFamily: "Inter",
						fontWeight: "400",
					}}
					color="#000"
				>
					The table you’re trying to access is unavailable. It may
					have been <b>deleted</b>, or the link is <b>incorrect</b>.
				</ODSLabel>
			) : ( */}
			<>
				<ODSLabel
					variant="h5"
					sx={{
						fontFamily: "Inter",
						fontWeight: "400",
						marginBottom: "2rem",
					}}
					color="#000"
				>
					Oops! It looks like this table is off-limits for you at the
					moment.
				</ODSLabel>

				<ODSLabel
					variant="h6"
					sx={{ fontFamily: "Inter", fontWeight: "400" }}
					color="#000"
				>
					If you’d like to make changes, please request access from
					the owner.
				</ODSLabel>
			</>
		</div>
	);
}

export default NoAccessEmptyState;
