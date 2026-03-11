import { Suspense, useState, useCallback, forwardRef } from "react";

import CollapsibleSection from "./components/CollapsibleSection/index";
import { getFilterComponent } from "./components/FilterComponents";
import styles from "./styles.module.scss";

function IcpFilterContent({ data = {} }, ref) {
	// Initialize with multiple sections - you can add more sections here
	const [sections, setSections] = useState({
		icpFilter: { isOpen: false, title: "Company Attribute" },
		locationFilter: { isOpen: false, title: "Location" },
		limitFilter: { isOpen: false, title: "Limit results" },
		// Example: Add more sections as needed
		// additionalSection: { isOpen: false, title: "Additional Filters" }
	});

	// State to track filter counts for each section
	const [filterCounts, setFilterCounts] = useState({
		icpFilter: 0,
		locationFilter: 0,
		limitFilter: 0,
	});

	const handleSectionToggle = (sectionId, isOpen) => {
		setSections((prev) => ({
			...prev,
			[sectionId]: { ...prev[sectionId], isOpen },
		}));
	};

	// Callback to update filter count for a specific section
	const handleFilterCountChange = useCallback((sectionId, count) => {
		setFilterCounts((prev) => ({
			...prev,
			[sectionId]: count,
		}));
	}, []);

	// Render the appropriate component for each section
	const renderFilterComponent = (sectionId, _section) => {
		const FilterComponent = getFilterComponent(sectionId);

		return (
			<Suspense
				fallback={<div className={styles.loading}>Loading...</div>}
			>
				<FilterComponent
					data={data}
					sectionId={sectionId}
					onFilterCountChange={handleFilterCountChange}
					ref={(r) => (ref.current.filterData[sectionId] = r)}
				/>
			</Suspense>
		);
	};

	return (
		<div className={styles.icp_filter_container}>
			{Object.entries(sections).map(([sectionId, section]) => (
				<CollapsibleSection
					key={sectionId}
					title={section.title}
					isOpen={section.isOpen}
					onToggle={handleSectionToggle}
					sectionId={sectionId}
					filterCount={filterCounts[sectionId] || 0}
				>
					{renderFilterComponent(sectionId, section)}
				</CollapsibleSection>
			))}
		</div>
	);
}

export default forwardRef(IcpFilterContent);
