import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";

import { DATA_NOT_FOUND_ICON } from "../../../../../../constants/Icons/commonIcons";

import styles from "./styles.module.scss";

function EmptyState() {
	return (
		<div className={styles.empty_state}>
			<div className={styles.empty_state_content}>
				<div className={styles.image_container}>
					<ODSIcon
						imageProps={{
							src: DATA_NOT_FOUND_ICON,
							alt: "No data found",
							width: "200px",
							height: "200px",
							className: styles.empty_state_image,
						}}
					/>
				</div>

				<div className={styles.oops_container}>
					<ODSLabel
						fontFamily="Inter"
						fontSize="4rem"
						fontWeight="700"
						color="#389b6a"
						className={styles.oops_text}
					>
						Oops!
					</ODSLabel>
				</div>

				<ODSLabel
					fontFamily="Inter"
					fontSize="1.5rem"
					fontWeight="600"
					color="#263238"
					className={styles.title}
				>
					No Ideal Customer Profiles Found
				</ODSLabel>

				<ODSLabel
					variant="body1"
					fontFamily="Inter"
					fontSize="1rem"
					color="#607D8B"
					className={styles.description}
				>
					We couldn't find any companies that match your Ideal
					Customer Profile criteria. Try adjusting your search
					parameters or broadening your filters to discover more
					potential customers.
				</ODSLabel>
			</div>
		</div>
	);
}

export default EmptyState;
