import { useSearchParams } from "react-router-dom";

import { decodeParams } from "../utils/encodeDecodeUrl";

// Type definitions for URL parameters
interface UrlParams {
	w?: string; // workspaceId
	pr?: string; // projectId
	pa?: string; // parentId
	a?: string; // assetId
	t?: string; // tableId
	v?: string; // viewId
	ai?: string; // aiOption
}

interface UseDecodedUrlParamsReturn {
	workspaceId: string;
	projectId: string;
	parentId: string;
	assetId: string;
	tableId: string;
	viewId: string;
	aiOption: string;
	decodedParams: UrlParams;
	searchParams: URLSearchParams;
	setSearchParams: (
		params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
	) => void;
}

/**
 * Custom hook to decode URL parameters from base64 encoded query string
 * @returns Decoded URL parameters and search params utilities
 */
function useDecodedUrlParams(): UseDecodedUrlParamsReturn {
	const [searchParams, setSearchParams] = useSearchParams();

	const decodedParams = decodeParams<UrlParams>(searchParams.get("q") || "");

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
