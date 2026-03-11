import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import { useState, useEffect } from "react";

import { PLAY_ICON } from "../../constants/Icons/commonIcons";
import {
	ENRICHMENT_ICON,
	LIST_ICON,
} from "../../constants/Icons/questionTypeIcons";

import styles from "./styles.module.scss";

const loadingMessages = {
	icp_search: [
		{ text: "Analyzing company domain...", icon: "OUTESearchIcon" },
		{
			text: "AI is identifying your Ideal Customer Profile...",
			icon: "WCAgentBotIcon",
		},
		{ text: "Scraping firmographic data...", icon: "OUTEPromptIcon" },
		{
			text: "Gathering company insights...",
			icon: "OUTECorporateIcon",
		},
		{ text: "Analyzing industry patterns...", icon: "ENRICHMENT_ICON" },
		{ text: "Almost ready with your ICP data!", icon: "PLAY_ICON" },
	],
	table_creation: [
		{ text: "Creating your enriched table...", icon: "WCAgentBotIcon" },
		{ text: "Connecting AI insights...", icon: "ENRICHMENT_ICON" },
		{ text: "Finalizing your sheet...", icon: "PLAY_ICON" },
	],
};

function EnhancedTableSkeleton({ loadingType = "icp_search", domain = "" }) {
	const [currentMessage, setCurrentMessage] = useState(0);

	const messages = loadingMessages[loadingType] || loadingMessages.icp_search;

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentMessage((prev) => (prev + 1) % messages.length);
		}, 2000);

		return () => clearInterval(interval);
	}, [messages.length]);

	// Function to get the appropriate icon component
	const getIconComponent = (iconName) => {
		// Map to actual ODSIcon names and regular icon URLs
		const iconMap = {
			OUTESearchIcon: "OUTESearchIcon", // Using actual ODSIcon name
			WCAgentBotIcon: "WCAgentBotIcon", // Using actual ODSIcon name
			OUTEPromptIcon: "OUTEPromptIcon", // Using actual ODSIcon name
			OUTECorporateIcon: "OUTECorporateIcon",
			ENRICHMENT_ICON: ENRICHMENT_ICON,
			LIST_ICON: LIST_ICON,
			PLAY_ICON: PLAY_ICON,
		};

		const iconValue = iconMap[iconName];

		// For ODSIcon names, use outeIconName prop
		if (
			[
				"OUTESearchIcon",
				"WCAgentBotIcon",
				"OUTEPromptIcon",
				"OUTECorporateIcon",
			].includes(iconName)
		) {
			return (
				<ODSIcon
					outeIconName={iconValue}
					outeIconProps={{
						sx: {
							width: "24px",
							height: "24px",
							color: "#ffffff",
						},
					}}
				/>
			);
		}

		// For regular icons, use the icon value directly
		return (
			<ODSIcon
				imageProps={{
					src: iconValue,
					alt: "Custom Image",
					width: "24px",
					height: "24px",
					style: {
						filter: "invert(1) brightness(2)", // turn black → white
					},
				}}
			/>
		);
	};

	const getLoadingTitle = () => {
		if (loadingType === "icp_search") {
			return "Searching for Ideal Customer Profiles";
		}
		return "Creating Your Enriched Table";
	};

	const getLoadingDescription = () => {
		if (loadingType === "icp_search") {
			return domain
				? `We're analyzing ${domain} and finding 10 similar companies that match your Ideal Customer Profile. This helps you understand your target market better.`
				: "We're analyzing your company domain and finding similar companies that match your Ideal Customer Profile. This helps you understand your target market better.";
		}
		return "Setting up your AI-enriched table with all the gathered insights and data.";
	};

	return (
		<div className={styles.enhanced_skeleton_container}>
			{/* Loading Header */}
			<div className={styles.loading_header}>
				<div className={styles.loading_icon_container}>
					<div className={styles.spinning_icon} />
				</div>
				<div className={styles.loading_content}>
					<ODSLabel
						fontFamily="Inter"
						fontSize="1.25rem"
						fontWeight="700"
						color="#212121"
					>
						{getLoadingTitle()}
					</ODSLabel>
					<ODSLabel
						variant="body2"
						fontFamily="Inter"
						color="#424242"
						sx={{ marginTop: "0.75rem", lineHeight: 1.6 }}
					>
						{getLoadingDescription()}
					</ODSLabel>
					<div className={styles.loading_message}>
						<div className={styles.message_content}>
							<div className={styles.message_icon}>
								{getIconComponent(
									messages[currentMessage].icon,
								)}
							</div>
							<ODSLabel
								variant="body2"
								fontFamily="Inter"
								color="#ffffff"
								fontWeight="600"
							>
								{messages[currentMessage].text}
							</ODSLabel>
						</div>
					</div>
				</div>
			</div>

			{/* Progress Bar */}
			<div className={styles.progress_container}>
				<div className={styles.progress_bar}>
					<div className={styles.progress_fill} />
				</div>
				<ODSLabel
					variant="caption"
					fontFamily="Inter"
					color="#424242"
					sx={{ marginTop: "0.75rem", fontWeight: 500 }}
				>
					This usually takes 10-15 seconds
				</ODSLabel>
			</div>

			{/* Table Skeleton */}
			{/* <div className={styles.table_skeleton_wrapper}>
				<TableSkeleton rows={rows} columns={columns} />
			</div> */}
		</div>
	);
}

export default EnhancedTableSkeleton;
