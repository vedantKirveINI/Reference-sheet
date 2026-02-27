import ODSIcon from "oute-ds-icon";
import { useState } from "react";

import styles from "./styles.module.scss";

const ICON_MAPPING = {
	icpFilter: "OUTECorporateIcon",
	locationFilter: "OUTELocationIcon",
	limitFilter: "OUTEClockIcon",
};

function CollapsibleSection({
	title = "Company Attribute",
	children,
	isOpen = true,
	onToggle,
	sectionId,
	filterCount = 0,
}) {
	const [isExpanded, setIsExpanded] = useState(isOpen);

	const handleToggle = () => {
		const newState = !isExpanded;
		setIsExpanded(newState);
		if (onToggle) {
			onToggle(sectionId, newState);
		}
	};

	return (
		<div className={styles.collapsible_section}>
			<div className={styles.section_header} onClick={handleToggle}>
				<div className={styles.section_header_icon}>
					<ODSIcon
						outeIconName={ICON_MAPPING[sectionId]}
						outeIconProps={{
							sx: {
								width: "16px",
								height: "16px",
							},
						}}
					/>
					<div className={styles.section_title}>{title}</div>
				</div>

				<div className={styles.section_header_right}>
					{filterCount > 0 && (
						<div className={styles.filter_count_badge}>
							{filterCount} filter{filterCount !== 1 ? "s" : ""}
						</div>
					)}
					<ODSIcon
						outeIconName={
							isExpanded
								? "OUTEExpandLessIcon"
								: "OUTEExpandMoreIcon"
						}
						outeIconProps={{
							sx: {
								width: "24px",
								height: "24px",
							},
						}}
					/>
				</div>
			</div>
			<div
				className={`${styles.section_content} ${isExpanded ? styles.content_expanded : styles.content_collapsed}`}
			>
				{children}
			</div>
		</div>
	);
}

export default CollapsibleSection;
