import { Upload } from "lucide-react";

import styles from "./styles.module.scss";

function DialogHeader({ title = "File Upload" }) {
	return (
		<div className={styles.title}>
			<div className={styles.icon}>
				<Upload
					style={{
						height: "24px",
						width: "24px",
					}}
				/>
			</div>
			{title}
		</div>
	);
}

export default DialogHeader;
