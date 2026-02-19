import { Share2 } from "lucide-react";

import styles from "./styles.module.scss";

function DialogTitle() {
	return (
		<div className={styles.title_container}>
			<Share2
				style={{
					height: "1.5rem",
					width: "1.5rem",
					color: "#212121",
				}}
			/>
			<div className={styles.title}>Share</div>
		</div>
	);
}

export default DialogTitle;
