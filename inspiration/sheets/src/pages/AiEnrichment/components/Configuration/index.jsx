import { HotTable } from "@handsontable/react";
import isEmpty from "lodash/isEmpty";
import kebabCase from "lodash/kebabCase";
import ODSLabel from "oute-ds-label";
import { useState } from "react";

import EnhancedTableSkeleton from "../../../../components/EnhancedTableSkeleton";
import QUESTION_TYPE_ICON_MAPPING from "../../../../constants/questionTypeIconMapping";

import ConfigContent from "./components/ConfigContent";
import EmptyState from "./components/EmptyState";
import IcpFilterContent from "./components/IcpFilterContent";
import ConfigurationStepper from "./components/Stepper";
import { PREVIEW_FIELDS, STEPS } from "./constant/companyProspectConstants";
import { companyProspectPreviewData } from "./data/dummyData";
import useEnrichmentConfiguration from "./hooks/useEnrichmentConfiguration";
import styles from "./styles.module.scss";

function Configuration() {
	const {
		ref,
		handleContinueClick = () => {},
		handleGetSyncData = () => {},
		setMode,
		previewTableData,
		createTableLoading,
		getPreviewDataLoading,
		previewData,
		activeStep,
		setActiveStep,
		getProspectDataLoading,
	} = useEnrichmentConfiguration();

	// State to track current domain value for real-time updates
	const [currentDomain, setCurrentDomain] = useState("");

	const handleNext = () => {
		if (activeStep === 0 || activeStep === 1) {
			// Step 1: Run ICP Search
			handleContinueClick();
		} else {
			setActiveStep((prevActiveStep) => prevActiveStep + 1);
		}
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	// Define step actions mapping
	const stepActions = [
		// Step 1 actions
		[
			{
				label: "SEARCH IDEAL CUSTOMER PROFILES",
				variant: "black",
				onClick: handleNext,
				loading: getPreviewDataLoading,
				disabled: getPreviewDataLoading,
			},
		],
		// Step 2 actions
		[
			{
				label: "Refetch Data",
				variant: "black-outlined",
				onClick: handleGetSyncData,
				loading: getProspectDataLoading,
				disabled: getProspectDataLoading,
			},
			{
				label: "Back",
				variant: "black-outlined",
				onClick: handleBack,
				disabled: createTableLoading || getProspectDataLoading,
			},
			{
				label: "CREATE ENRICHED TABLE",
				variant: "black",
				onClick: handleNext,
				loading: createTableLoading,
				disabled: createTableLoading || getProspectDataLoading,
			},
		],
	];

	// Get domain from ref for loading message
	const getDomain = () => {
		// Prioritize currentDomain (real-time) over ref data (submitted data)
		const domain = currentDomain || ref.current?.data?.[0]?.url || "";
		return domain;
	};

	// Get preview description based on loading state
	const getPreviewDescription = () => {
		if (getPreviewDataLoading) {
			return "AI is analyzing your company and finding similar businesses that match your Ideal Customer Profile. This helps you understand your target market and identify potential customers.";
		}
		if (createTableLoading) {
			return "Creating your AI-enriched table with all the gathered Ideal Customer Profile insights and data.";
		}
		return "Sample records showing how your Ideal Customer Profile data will appear. These are real companies similar to your business that can help you understand your target market better.";
	};

	// Get data to display based on step
	const getTableData = () => {
		if (activeStep === 0) {
			// Step 0: Show dummy data
			return companyProspectPreviewData;
		} else if (activeStep === 1) {
			// Step 1: Show prospect data
			return previewTableData;
		}
		return [];
	};

	// Render loading component based on state
	const renderLoadingComponent = () => {
		if (getPreviewDataLoading || getProspectDataLoading) {
			return (
				<EnhancedTableSkeleton
					loadingType="icp_search"
					domain={getDomain()}
				/>
			);
		}
		if (createTableLoading) {
			return <EnhancedTableSkeleton loadingType="table_creation" />;
		}
		return null;
	};

	// Render empty state when no data
	const renderEmptyState = () => {
		const data = getTableData();
		if (
			activeStep === 1 &&
			(isEmpty(data) || data?.length === 0) &&
			!getPreviewDataLoading &&
			!getProspectDataLoading
		) {
			return <EmptyState />;
		}
		return null;
	};

	// Define step content
	const stepContent = [
		// Step 1 content
		<>
			<div className={styles.configuration_content}>
				<ConfigContent
					ref={(r) => {
						ref.current.saveAiConfigurationData =
							r?.saveAiConfigurationData;
					}}
					setMode={setMode}
					loading={getPreviewDataLoading || createTableLoading}
					onDomainChange={setCurrentDomain}
					value={ref.current?.data[0]}
				/>
			</div>
		</>,
		// Step 2 content
		<>
			{previewData && (
				<IcpFilterContent data={previewData?.data} ref={ref} />
			)}
		</>,
	];

	return (
		<div className={styles.enrichment_page}>
			<div className={styles.configuration_container}>
				<ConfigurationStepper
					activeStep={activeStep}
					steps={STEPS}
					onNext={handleNext}
					onBack={handleBack}
					stepContent={stepContent}
					stepActions={stepActions}
					loading={getPreviewDataLoading || createTableLoading}
				/>
			</div>

			<div className={styles.preview_container}>
				<div className={styles.preview_title_container}>
					<ODSLabel
						fontFamily="Inter"
						fontSize="1rem"
						fontWeight="600"
						color="#263238"
					>
						Ideal Customer Profile Preview
					</ODSLabel>

					<ODSLabel
						variant="body2"
						fontFamily="Inter"
						color="#607D8B"
					>
						{getPreviewDescription()}
					</ODSLabel>
				</div>

				{renderLoadingComponent() || renderEmptyState() || (
					<HotTable
						data-testid="preview-table"
						className={"ht-theme-main"}
						rowHeights={33}
						columnHeaderHeight={33}
						readOnly={true}
						data={getTableData()}
						height="calc(100vh - 15rem)"
						colHeaders={(index) => {
							const currentField = PREVIEW_FIELDS[index];

							const { name, type } = currentField || {};

							const iconSrc =
								QUESTION_TYPE_ICON_MAPPING?.[type] ||
								QUESTION_TYPE_ICON_MAPPING?.SHORT_TEXT;

							return `
						        <div class="column_container" data-testid="${kebabCase(`column-${type}-${index}`)}">
						            <div class="column_header">
						                <img
						                    src="${iconSrc}"
						                    id="field-type-icon"
						                    alt="icon"
						                    class="row_header_icon"
						                />
						                <span class="column_header_text">
						                    ${name}
						                </span>
						            </div>
						        </div>
						    `;
						}}
						columns={[
							{ data: "title", width: 250 },
							{ data: "url", width: 250 },
							{ data: "content", width: 250 },
						]}
						manualColumnResize={true}
						manualRowResize={true}
						rowHeaders={true}
						licenseKey="non-commercial-and-evaluation"
					/>
				)}
			</div>
		</div>
	);
}

export default Configuration;
