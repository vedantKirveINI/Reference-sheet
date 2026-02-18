import isEmpty from "lodash/isEmpty";
import ODSIcon from "@/lib/oute-icon";
import { forwardRef, useImperativeHandle } from "react";

import { NEW_LABEL_BADGE_ICON } from "@/constants/Icons/commonIcons";
import QUESTION_TYPE_ICON_MAPPING from "@/constants/questionTypeIconMapping";
import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import ENHANCEMENT_OPTIONS from "../../constants/enhancementOptions";
import ENRICHMENT_ICON_MAPPING from "../../constants/enrichmentIconMapping";
import useEnrichmentSettings from "../../hooks/useEnrichmentSettings";
import processEnrichmentData from "../../utils/processEnrichmentData";

function EnrichmentField(
	{ value = {}, fields = [], controlErrorRef = {} },
	ref,
) {
	const {
		errors = {},
		control = {},
		handleSubmit = () => {},
		updatedRequiredInputControls = [],
		commonControls = [],
		configurationControls = [],
		entityType = {},
		runConfigurationControls = [],
		fieldsToEnrich: prevFieldsEnriched = [],
	} = useEnrichmentSettings({
		value,
		fields,
	});

	useImperativeHandle(ref, () => ({
		saveFormData() {
			return new Promise((resolve, reject) => {
				handleSubmit(
					(formData) => {
						const processedData = processEnrichmentData({
							formData,
							prevFieldsEnriched,
						});

						resolve(processedData);
					},
					(error) => reject(error),
				)();
			});
		},
	}));

	return (
		<>
			<span className="text-xs uppercase tracking-wider font-medium">Required Inputs</span>
			{updatedRequiredInputControls.map((config) => {
				const {
					name,
					label,
					type,
					inputFieldDescription = "",
				} = config || {};

				const Element = getField(type);

				if (name === "entityType") {
					config = {
						...config,
						renderOption: (props, option, { selected }) => {
							const { key, ...rest } = props;

							return (
								<li
									key={key}
									{...rest}
									className="flex gap-2 py-3 px-2 cursor-pointer"
								>
									<ODSIcon
										imageProps={{
											src: ENRICHMENT_ICON_MAPPING[
												option?.key
											],
											className: `w-5 h-5 ${selected ? "invert brightness-[1000%]" : ""}`,
										}}
									/>
									<span
										className={`text-xs font-[Inter] font-normal ${selected ? "text-white" : "text-[#263238]"}`}
									>
										{option?.label || ""}
									</span>
								</li>
							);
						},
						renderInput: (params) => {
							const selectedEnrichment = ENHANCEMENT_OPTIONS.find(
								(option) =>
									option.label === params.inputProps?.value,
							);

							return (
								<div
									ref={(ele) => {
										if (ele && controlErrorRef?.current) {
											controlErrorRef.current[name] = ele;
										}
									}}
									data-testid="select-enrichment-type"
									className="relative"
								>
									<div className="flex items-center gap-2 w-full border border-[#d1d5db] rounded-md bg-white focus-within:border-[#1f2937] focus-within:border-2 transition-all duration-200">
										{ENRICHMENT_ICON_MAPPING[selectedEnrichment?.key] && (
											<ODSIcon
												imageProps={{
													src: ENRICHMENT_ICON_MAPPING[selectedEnrichment?.key],
													className: "w-5 h-5 ml-3",
												}}
											/>
										)}
										<input
											{...params.inputProps}
											placeholder={config.textFieldProps?.placeholder}
											className="flex-1 text-base font-[Inter] py-2 px-3 border-none outline-none bg-transparent"
										/>
										{params.InputProps?.endAdornment}
									</div>
								</div>
							);
						},
					};
				}

				if (name?.startsWith("identifier_")) {
					config = {
						...config,
						renderOption: (props, option, { selected }) => {
							const { key, ...rest } = props;

							return (
								<li
									key={key}
									{...rest}
									className="flex gap-2 py-3 px-2 cursor-pointer"
								>
									<ODSIcon
										imageProps={{
											src: QUESTION_TYPE_ICON_MAPPING[
												option?.type
											],
											className: `w-5 h-5 ${selected ? "invert brightness-[1000%]" : ""}`,
										}}
									/>
									<span
										className={`text-xs font-[Inter] font-normal ${selected ? "text-white" : "text-[#263238]"}`}
									>
										{option?.name}
									</span>

									{option?.value === "ENRICHMENT" && (
										<ODSIcon
											imageProps={{
												src: NEW_LABEL_BADGE_ICON,
											}}
										/>
									)}
								</li>
							);
						},
						renderInput: (params) => {
							const option = [...fields].find(
								(field) =>
									field?.name === params.inputProps?.value,
							);

							let isErrored = false;
							if (
								!isEmpty(value) &&
								!option &&
								option?.required
							) {
								isErrored = true;
							}

							return (
								<div
									ref={(ele) => {
										if (ele && controlErrorRef?.current) {
											controlErrorRef.current[name] = ele;
										}
									}}
									data-testid="select-identifier-type"
									className="relative"
								>
									<div className={`flex items-center gap-2 w-full border rounded-md bg-white focus-within:border-[#1f2937] focus-within:border-2 transition-all duration-200 ${isErrored ? "border-red-500" : "border-[#d1d5db]"}`}>
										{QUESTION_TYPE_ICON_MAPPING[option?.type] && (
											<ODSIcon
												imageProps={{
													src: QUESTION_TYPE_ICON_MAPPING[option.type],
													className: "w-5 h-5 ml-3",
												}}
											/>
										)}
										<input
											{...params.inputProps}
											placeholder={config.textFieldProps?.placeholder}
											className="flex-1 text-base font-[Inter] py-2 px-3 border-none outline-none bg-transparent"
										/>
										{params.InputProps?.endAdornment}
									</div>
									{isErrored && (
										<span className="text-xs text-red-500 mt-1 ml-3">
											Please select a valid identifier
										</span>
									)}
								</div>
							);
						},
					};
				}

				return (
					<div className="py-5 w-full box-border" key={name}>
						<div className="m-0 mb-2 ml-2 text-[0.85rem]">{label}</div>

						<Element
							{...config}
							control={control}
							errors={errors}
						/>

						{name?.startsWith("identifier_") && (
							<span
								className="text-sm text-[#607D8B] mt-3 ml-2.5 block"
							>
								{inputFieldDescription}
							</span>
						)}

						<ErrorLabel errors={errors} name={name} />
					</div>
				);
			})}

			{!isEmpty(entityType) && (
				<>
					<div className="my-5 bg-[#cfd8dc] w-full h-[0.047rem]" />

					<span className="text-xs uppercase tracking-wider font-medium">Configure</span>
					<div className="py-5 w-full box-border">
						<span className="text-sm text-[#263238]">
							Add data as fields to your table
						</span>
						<span className="text-xs text-[#607D8B] block mt-1">
							Select which data you would like added as a field,
							then run to see your results.
						</span>
					</div>

					<div className="grid grid-cols-2 gap-5">
						{configurationControls.map((config) => {
							const { name, type } = config || {};
							const Element = getField(type);

							return (
								<Element
									{...config}
									control={control}
									key={name}
								/>
							);
						})}
					</div>

					<div className="my-5 bg-[#cfd8dc] w-full h-[0.047rem]" />

					<span className="text-xs uppercase tracking-wider font-medium">Run Configuration</span>
					<div className="py-5 w-full box-border">
						{runConfigurationControls.map((config) => {
							const { name, type } = config || {};
							const Element = getField(type);

							return (
								<Element
									{...config}
									control={control}
									key={name}
								/>
							);
						})}
					</div>
				</>
			)}
			<div className="my-5 bg-[#cfd8dc] w-full h-[0.047rem]" />

			{!isEmpty(entityType) &&
				commonControls.map((config) => {
					const { name, type, label } = config || {};
					const Element = getField(type);

					return (
						<div className="py-5 w-full box-border" key={name}>
							<div className="m-0 mb-2 ml-2 text-[0.85rem]">{label}</div>
							<Element {...config} control={control} />
						</div>
					);
				})}
		</>
	);
}

export default forwardRef(EnrichmentField);
