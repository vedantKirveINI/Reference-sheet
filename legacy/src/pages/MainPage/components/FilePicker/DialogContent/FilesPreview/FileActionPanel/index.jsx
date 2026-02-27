import ODSIcon from "oute-ds-icon";

import styles from "./styles.module.scss";

function FileActionPanel({
	loading = false,
	removeFile = () => {},
	file = {},
	index = 0,
}) {
	return (
		<div className={styles.file_right}>
			{loading ? (
				<div className={styles.loader} />
			) : (
				<ODSIcon
					onClick={() => {
						removeFile(index);
					}}
					outeIconName={"OUTECloseIcon"}
				/>
			)}
		</div>
	);
}

export default FileActionPanel;
