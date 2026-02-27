import { useSearchParams } from "react-router-dom";

import { decodeParams } from "../utils/encodeDecodeUrl";

function useDecodedUrlParams() {
	const [searchParams, setSearchParams] = useSearchParams();

	const decodedParams = decodeParams(searchParams.get("q"));

	const {
		w: workspaceId = "",
		pr: projectId = "",
		pa: parentId = "",
		a: assetId = "",
		t: tableId = "",
		v: viewId = "",
		ai: aiOption = "companies", // Default to "companies" if not specified
	} = decodedParams;

	return {
		workspaceId,
		projectId,
		parentId,
		assetId,
		tableId,
		viewId,
		aiOption,
		decodedParams,
		searchParams,
		setSearchParams,
	};
}

export default useDecodedUrlParams;
