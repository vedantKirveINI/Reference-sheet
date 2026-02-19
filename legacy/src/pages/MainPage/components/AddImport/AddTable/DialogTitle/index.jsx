import { Plus } from "lucide-react";

import styles from "./styles.module.scss";

function DialogTitle() {
	return (
		<div className={styles.title_container}>
			<Plus
				style={{
					height: "1.5rem",
					width: "1.5rem",
					color: "#263238",
				}}
			/>
			<div className={styles.title}>New Table</div>
		</div>
	);
}

export default DialogTitle;
