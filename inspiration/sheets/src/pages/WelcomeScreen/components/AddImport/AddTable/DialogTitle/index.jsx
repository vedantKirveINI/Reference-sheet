import Icon from "oute-ds-icon";

import styles from "./styles.module.scss";

function DialogTitle() {
	return (
		<div className={styles.title_container}>
			<Icon
				outeIconName="OUTEAddIcon"
				outeIconProps={{
					sx: {
						height: "1.5rem",
						width: "1.5rem",
					},
				}}
			/>
			<div className={styles.title}>New Table</div>
		</div>
	);
}

export default DialogTitle;
