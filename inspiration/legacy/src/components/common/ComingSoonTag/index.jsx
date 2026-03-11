import ODSIcon from "oute-ds-icon";

import styles from "./styles.module.scss";

/**
 * ComingSoonTag - Reusable tag component for features that are coming soon
 * Can be used across the project to indicate upcoming features
 * 
 * @param {string} text - Text to display (default: "Coming soon")
 * @param {string} variant - Variant style: "default" | "blue" | "gray"
 * @param {object} className - Additional CSS classes
 */
function ComingSoonTag({
	text = "Coming soon",
	variant = "default",
	className = "",
}) {
	return (
		<div
			className={`${styles.coming_soon_tag} ${styles[variant]} ${className}`}
		>
			<ODSIcon
				outeIconName="OUTEInfoIcon"
				outeIconProps={{
					sx: {
						width: "10px",
						height: "10px",
						marginRight: "3px",
					},
				}}
			/>
			<span className={styles.tag_text}>{text}</span>
		</div>
	);
}

export default ComingSoonTag;

