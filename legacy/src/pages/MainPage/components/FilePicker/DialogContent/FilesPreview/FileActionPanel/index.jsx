import { X } from "lucide-react";

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
				<X
					onClick={() => {
						removeFile(index);
					}}
					style={{
						width: "1.25rem",
						height: "1.25rem",
						cursor: "pointer",
						color: "#666",
					}}
				/>
			)}
		</div>
	);
}

export default FileActionPanel;
