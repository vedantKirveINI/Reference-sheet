import ODSIcon from "@/lib/oute-icon";

import styles from "./styles.module.scss";

function FileActionPanel({
	loading = false,
	removeFile = () => {},
	file = {},
	index = 0,
}) {
	return (
		<div className="flex items-center flex-end">
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
