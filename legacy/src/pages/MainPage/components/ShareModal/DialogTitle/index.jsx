import ODSIcon from "oute-ds-icon";

import styles from "./styles.module.scss";

function DialogTitle() {
	return (
		<div className={styles.title_container}>
			<ODSIcon
				outeIconName="OUTEShareIcon"
				outeIconProps={{
					sx: {
						height: "1.5rem",
						width: "1.5rem",
						color: "#212121",
					},
				}}
			/>
			<div className={styles.title}>Share</div>
		</div>
	);
}

export default DialogTitle;
