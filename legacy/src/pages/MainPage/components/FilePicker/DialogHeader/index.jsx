import ODSIcon from "oute-ds-icon";

import styles from "./styles.module.scss";

function DialogHeader({ title = "File Upload" }) {
	return (
		<div className={styles.title}>
			<div className={styles.icon}>
				<ODSIcon
					outeIconName={"UploadFileIcon"}
					outeIconProps={{
						sx: {
							height: "24px",
							width: "24px",
						},
					}}
				/>
			</div>
			{title}
		</div>
	);
}

export default DialogHeader;
