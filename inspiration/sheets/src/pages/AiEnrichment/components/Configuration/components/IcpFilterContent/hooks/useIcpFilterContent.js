import { useMemo } from "react";

import { createFormFields } from "../utils/icpUtils";

function useIcpFilterContent(data = {}) {
	// Extract the icp object from the data
	const { icp = {} } = data;

	// Generate form fields from icp data using useMemo for performance
	const formFields = useMemo(() => {
		return createFormFields(icp.icp || {});
	}, [icp.icp]);

	return {
		formFields,
	};
}

export default useIcpFilterContent;
