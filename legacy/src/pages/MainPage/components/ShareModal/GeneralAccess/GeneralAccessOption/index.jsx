import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";

import styles from "./styles.module.scss";

const GeneralAccessOption = ({ icon, label, action }) => {
	return (
		<div className={styles.option}>
			<div className={styles.label_group}>
				<div className={styles.icon_container}>
					<ODSIcon
						outeIconName={icon}
						outeIconProps={{
							sx: {
								height: "2.25rem",
								width: "2.25rem",
								color: "#212121",
							},
						}}
					/>
				</div>

				<ODSLabel
					variant="subtitle1"
					sx={{ fontWeight: 500, fontFamily: "Inter" }}
				>
					{label}
				</ODSLabel>
			</div>

			<div className={styles.action_container}>{action}</div>
		</div>
	);
};

export default GeneralAccessOption;
