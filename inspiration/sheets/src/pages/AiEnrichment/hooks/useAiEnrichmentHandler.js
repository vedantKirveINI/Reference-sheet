import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import useDecodedUrlParams from "../../../hooks/useDecodedUrlParams";

function useAiEnrichmentHandler() {
	const navigate = useNavigate();
	const { searchParams } = useDecodedUrlParams();

	const handleBackClick = useCallback(() => {
		const currentQuery = searchParams.get("q");

		const queryString = currentQuery ? `?q=${currentQuery}` : "";
		navigate(`/${queryString}`);
	}, [navigate, searchParams]);

	return {
		handleBackClick,
	};
}

export default useAiEnrichmentHandler;
