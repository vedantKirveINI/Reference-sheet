import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import { useMemo } from "react";

import CircularLoader from "../../../../../components/Loading";

import styles from "./styles.module.scss";

const CREATE_TABLE_ICON =
	"https://cdn-v1.tinycommand.com/1234567890/1759324276679/Create-table.svg";

function Content({
	handleAIEnrichmentClick,
	handleBlankTableClick,
	createSheetLoading = false,
}) {
	const aiOptions = useMemo(
		() => [
			{
				id: "find-company",
				title: "Find Customer (Company)",
				description:
					"Build your ideal customer profile with AI-powered company discovery and ICP analysis",
				iconName: "OUTECorporateIcon",
				onClick: () => handleAIEnrichmentClick("companies"),
			},
			{
				id: "find-people",
				title: "Find Customer (People)",
				description:
					"Identify key decision makers and build detailed ICP profiles using AI intelligence",
				iconName: "OUTEMembersIcon",
				onClick: () => handleAIEnrichmentClick("people"),
			},
			{
				id: "enrich-email-info",
				title: "Enrich Email Info",
				description:
					"Generate professional email addresses with high accuracy",
				iconName: "WCEmailIcon",
				enrichmentKey: "email",
				onClick: () => handleBlankTableClick("email"),
			},
			{
				id: "enrich-company-info",
				title: "Enrich Company Info",
				description:
					"Enhance company data with industry insights and details",
				iconName: "OUTECorporateIcon",
				enrichmentKey: "company",
				onClick: () => handleBlankTableClick("company"),
			},
			{
				id: "enrich-person-info",
				title: "Enrich Person Info",
				description:
					"Get comprehensive professional profiles and backgrounds",
				iconName: "OUTEMembersIcon",
				enrichmentKey: "person",
				onClick: () => handleBlankTableClick("person"),
			},
		],
		[handleAIEnrichmentClick, handleBlankTableClick],
	);

	return (
		<div
			className={`${styles.modal_container} ${createSheetLoading ? styles.disabled : ""}`}
		>
			<div className={styles.modal_title}>
				<div className={styles.modal_title_text}>
					How do you want to get started?
				</div>
			</div>

			<div className={styles.modal_content}>
				{/* Left Section - Create Table */}
				<div className={styles.left_section}>
					<div className={styles.create_table_card}>
						<div
							onClick={
								createSheetLoading
									? undefined
									: () => handleBlankTableClick()
							}
						>
							<ODSIcon
								imageProps={{
									src: CREATE_TABLE_ICON,
									className: styles.icon,
								}}
							/>
							<ODSLabel
								variant="h5"
								fontWeight="600"
								data-testid="blank-table-text"
								sx={{ marginBottom: "1rem" }}
							>
								Create blank table
							</ODSLabel>

							<ODSLabel
								fontWeight="400"
								color="#607D8B"
								variant="h6"
							>
								Click to create a table from scratch
							</ODSLabel>
						</div>
					</div>
				</div>

				{/* Vertical Divider */}
				<div className={styles.vertical_divider}>
					<div className={styles.divider_text}>OR</div>
				</div>

				{/* Right Section - AI Options */}
				<div className={styles.right_section}>
					<div className={styles.ai_section_header}>
						<div className={styles.ai_header_pill}>
							<div className={styles.ai_dot} />
							<ODSLabel
								variant="h6"
								fontWeight="600"
								className={styles.ai_title}
							>
								AI-Powered Discovery
							</ODSLabel>
						</div>
					</div>

					<div className={styles.ai_options_list}>
						{aiOptions.map((option, index) => (
							<div
								key={option.id}
								className={styles.ai_option_card}
								onClick={
									createSheetLoading
										? undefined
										: option.onClick
								}
								style={{
									"--delay": `${index * 0.1}s`,
								}}
							>
								<div className={styles.ai_option_icon}>
									<ODSIcon
										outeIconName={option.iconName}
										outeIconProps={{
											sx: {
												color: "#212121",
												width: "24px",
												height: "24px",
											},
										}}
									/>
								</div>
								<div className={styles.ai_option_content}>
									<ODSLabel
										variant="h6"
										fontWeight="600"
										className={styles.ai_option_title}
									>
										{option.title}
									</ODSLabel>
									<ODSLabel
										variant="body1"
										className={styles.ai_option_description}
									>
										{option.description}
									</ODSLabel>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Loading Overlay */}
			{createSheetLoading && (
				<div className={styles.loading_overlay}>
					<div className={styles.loading_content}>
						<CircularLoader />
						<ODSLabel
							variant="h6"
							fontWeight="600"
							className={styles.loading_title}
						>
							Creating table...
						</ODSLabel>
						<ODSLabel
							variant="body2"
							className={styles.loading_subtitle}
						>
							Please wait while we create your table
						</ODSLabel>
					</div>
				</div>
			)}
		</div>
	);
}

export default Content;
