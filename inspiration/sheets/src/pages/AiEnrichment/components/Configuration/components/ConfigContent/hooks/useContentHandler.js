import { useEffect } from "react";
import { useForm } from "react-hook-form";

import useDecodedUrlParams from "../../../../../../../hooks/useDecodedUrlParams";
import getConfigurationControls from "../../../config/getConfigurationControls";
import AI_ENRICHMENT_OPTIONS from "../../../constant/aiEnrichmentOptions";

function useContentHandler({ value = {}, onDomainChange } = {}) {
	const { aiOption } = useDecodedUrlParams();

	// Get the AI option from URL or fallback to first option
	const selectedOption =
		AI_ENRICHMENT_OPTIONS.find((option) => option.value === aiOption) ||
		AI_ENRICHMENT_OPTIONS[0];

	const defaultType = value.type
		? {
				label: value?.type?.label,
				value: value?.type?.value,
			}
		: selectedOption || "";

	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm({
		defaultValues: {
			type: defaultType,
			url: value?.url || "",
		},
	});

	// Watch for URL changes and call onDomainChange
	const watchedUrl = watch("url");

	// Use useEffect to properly track URL changes
	useEffect(() => {
		if (onDomainChange && watchedUrl) {
			onDomainChange(watchedUrl);
		}
	}, [watchedUrl, onDomainChange]);

	const controls = getConfigurationControls();

	return {
		controls,
		control,
		handleSubmit,
		errors,
	};
}

export default useContentHandler;
