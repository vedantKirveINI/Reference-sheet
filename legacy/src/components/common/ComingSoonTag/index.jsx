import { Info } from "lucide-react";

import styles from "./styles.module.scss";

function ComingSoonTag({
	text = "Coming soon",
	variant = "default",
	className = "",
}) {
	return (
		<div
			className={`${styles.coming_soon_tag} ${styles[variant]} ${className}`}
		>
			<Info
				style={{
					width: "10px",
					height: "10px",
					marginRight: "3px",
				}}
			/>
			<span className={styles.tag_text}>{text}</span>
		</div>
	);
}

export default ComingSoonTag;
