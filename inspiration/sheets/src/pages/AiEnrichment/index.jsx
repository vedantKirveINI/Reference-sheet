import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";

import useDecodedUrlParams from "../../hooks/useDecodedUrlParams";

import Configuration from "./components/Configuration";
import useAiEnrichmentHandler from "./hooks/useAiEnrichmentHandler";
import styles from "./styles.module.scss";

// Get the title based on the selected AI option
const getTitle = (aiOption) => {
	switch (aiOption) {
		case "people":
			return "Find Customers (People)";
		case "companies":
		default:
			return "Find Customers (Company)";
	}
};

const getDescription = (aiOption) => {
	switch (aiOption) {
		case "people":
			return "Identify key decision makers and build detailed ICP profiles using AI intelligence. Enter a company domain to find similar businesses and their key personnel.";
		case "companies":
		default:
			return "Enter a company domain to find similar businesses that match your Ideal Customer Profile. Discover potential customers with similar industry, size, and characteristics.";
	}
};

function AiEnrichment() {
	const { handleBackClick = () => {} } = useAiEnrichmentHandler();
	const { aiOption } = useDecodedUrlParams();

	return (
		<div className={styles.ai_enrichment_page}>
			<div className={styles.ai_enrichment_page_header}>
				<ODSIcon
					outeIconName="OUTEChevronLeftIcon"
					outeIconProps={{
						sx: {
							color: "#263238",
							width: "1.5rem",
							height: "1.5rem",
						},
					}}
					onClick={handleBackClick}
				/>
				<div className={styles.ai_enrichment_title_container}>
					<ODSLabel
						variant="h6"
						fontWeight="500"
						sx={{ marginBottom: "0.5rem" }}
					>
						{getTitle(aiOption)}
					</ODSLabel>
					<ODSLabel color="#607D8B" variant="body2">
						{getDescription(aiOption)}
					</ODSLabel>
				</div>
			</div>

			<Configuration />
		</div>
	);
}

export default AiEnrichment;
