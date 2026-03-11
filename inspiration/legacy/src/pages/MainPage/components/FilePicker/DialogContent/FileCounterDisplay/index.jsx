import styles from "./styles.module.scss";

const ICON_URL =
	"https://cdn-v1.tinycommand.com/1234567890/1748606944982/InfoTables.svg";

const FileCounterDisplay = ({ fileCount }) => {
	return (
		<section
			className={styles.file_counter_container}
			aria-label={`File count: ${fileCount}`}
			data-testid="file-counter-container"
		>
			<div
				className={styles.icon_wrapper}
				data-testid="file-counter-icon-wrapper"
			>
				<img
					src={ICON_URL || "/placeholder.svg"}
					alt="Information icon"
					className={styles.icon_image}
					data-testid="file-counter-icon"
				/>
			</div>
			<div
				className={styles.content_wrapper}
				data-testid="file-counter-content"
			>
				<h3
					className={styles.counter_title}
					data-testid="file-counter-title"
				>
					File limit reached ({fileCount}).
				</h3>
				<p
					className={styles.counter_description}
					data-testid="file-counter-description"
				>
					Remove the existing file to upload a new one.
				</p>
			</div>
		</section>
	);
};

export default FileCounterDisplay;
