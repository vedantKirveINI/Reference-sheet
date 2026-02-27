import { lazy } from "react";

// Lazy load components for better performance
const IcpFilter = lazy(() => import("../IcpFilter"));
const LocationFilter = lazy(() => import("../LocationFilter"));
const LimitFilter = lazy(() => import("../LimitFilter"));

// Component mapping based on filter type
export const FILTER_COMPONENTS = {
	icpFilter: IcpFilter,
	locationFilter: LocationFilter,
	limitFilter: LimitFilter,
	// Add more filter components here as needed
	// additionalFilter: AdditionalFilter,
};

// Default component for unknown filter types
export const DefaultFilter = () => (
	<div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
		No filter component available for this section.
	</div>
);

// Helper function to get the appropriate component
export const getFilterComponent = (filterType) => {
	return FILTER_COMPONENTS[filterType] || DefaultFilter;
};
