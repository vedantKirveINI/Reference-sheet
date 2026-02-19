import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import ODSTextField from "oute-ds-text-field";
import { forwardRef, useImperativeHandle } from "react";

import { NEW_LABEL_BADGE_ICON } from "@/constants/Icons/commonIcons";
import QUESTION_TYPE_ICON_MAPPING from "@/constants/questionTypeIconMapping";
import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import ENHANCEMENT_OPTIONS from "../../constants/enhancementOptions";
import ENRICHMENT_ICON_MAPPING from "../../constants/enrichmentIconMapping";
import useEnrichmentSettings from "../../hooks/useEnrichmentSettings";
import processEnrichmentData from "../../utils/processEnrichmentData";

import styles from "./styles.module.scss";

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
			<ODSLabel variant="capital">Required Inputs</ODSLabel>
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
									style={{
										display: "flex",
										gap: "0.5rem",
										padding: "0.75rem 0.5rem",
										cursor: "pointer",
									}}
								>
									<ODSIcon
										imageProps={{
											src: ENRICHMENT_ICON_MAPPING[
												option?.key
											],
											className: selected
												? styles.selected_option_icon
												: styles.option_icon,
										}}
									/>
									<ODSLabel
										variant="subtitle2"
										sx={{
											fontFamily: "Inter",
											fontWeight: "400",
										}}
										color={selected ? "white" : "#263238"}
									>
										{option?.label || ""}
									</ODSLabel>
								</li>
							);
						},
						renderInput: (params) => {
							const selectedEnrichment = ENHANCEMENT_OPTIONS.find(
								(option) =>
									option.label === params.inputProps?.value,
							);

							return (
								<ODSTextField
									ref={(ele) => {
										if (ele && controlErrorRef?.current) {
											controlErrorRef.current[name] = ele;
										}
									}}
									data-testid="select-enrichment-type"
									{...params}
									className="black"
									placeholder={
										config.textFieldProps?.placeholder
									}
									InputProps={{
										...params.InputProps,
										startAdornment: ENRICHMENT_ICON_MAPPING[
											selectedEnrichment?.key
										] && (
											<ODSIcon
												imageProps={{
													src: ENRICHMENT_ICON_MAPPING[
														selectedEnrichment?.key
													],
													className:
														styles.option_icon,
												}}
											/>
										),
									}}
									sx={{
										"& .MuiInputBase-input": {
											fontSize: "1rem",
										},
									}}
								/>
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
									style={{
										display: "flex",
										gap: "0.5rem",
										padding: "0.75rem 0.5rem",
										cursor: "pointer",
									}}
								>
									<ODSIcon
										imageProps={{
											src: QUESTION_TYPE_ICON_MAPPING[
												option?.type
											],
											className: selected
												? styles.selected_option_icon
												: styles.option_icon,
										}}
									/>
									<ODSLabel
										variant="subtitle2"
										sx={{
											fontFamily: "Inter",
											fontWeight: "400",
										}}
										color={selected ? "white" : "#263238"}
									>
										{option?.name}
									</ODSLabel>

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
								<ODSTextField
									ref={(ele) => {
										if (ele && controlErrorRef?.current) {
											controlErrorRef.current[name] = ele;
										}
									}}
									error={isErrored}
									helperText={
										isErrored
											? "Please select a valid identifier"
											: ""
									}
									data-testid="select-identifier-type"
									{...params}
									className="black"
									placeholder={
										config.textFieldProps?.placeholder
									}
									InputProps={{
										...params.InputProps,
										startAdornment:
											QUESTION_TYPE_ICON_MAPPING[
												option?.type
											] && (
												<ODSIcon
													imageProps={{
														src: QUESTION_TYPE_ICON_MAPPING[
															option.type
														],
														className:
															styles.option_icon,
													}}
												/>
											),
									}}
									sx={{
										"& .MuiInputBase-input": {
											fontSize: "1rem",
										},
									}}
								/>
							);
						},
					};
				}

				return (
					<div className={styles.field_container} key={name}>
						<div className={styles.label}>{label}</div>

						<Element
							{...config}
							control={control}
							errors={errors}
						/>

						{name?.startsWith("identifier_") && (
							<ODSLabel
								variant="body2"
								color="#607D8B"
								sx={{ margin: "0.75rem 0 0 0.625rem" }}
							>
								{inputFieldDescription}
							</ODSLabel>
						)}

						<ErrorLabel errors={errors} name={name} />
					</div>
				);
			})}

			{!isEmpty(entityType) && (
				<>
					<div className={styles.divider} />

					<ODSLabel variant="capital">Configure</ODSLabel>
					<div className={styles.field_container}>
						<ODSLabel variant="subtitle1" color="#263238">
							Add data as fields to your table
						</ODSLabel>
						<ODSLabel variant="subtitle2" color="#607D8B">
							Select which data you would like added as a field,
							then run to see your results.
						</ODSLabel>
					</div>

					<div className={styles.configuration_container}>
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

					<div className={styles.divider} />

					<ODSLabel variant="capital">Run Configuration</ODSLabel>
					<div className={styles.field_container}>
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
			<div className={styles.divider} />

			{!isEmpty(entityType) &&
				commonControls.map((config) => {
					const { name, type, label } = config || {};
					const Element = getField(type);

					return (
						<div className={styles.field_container} key={name}>
							<div className={styles.label}>{label}</div>
							<Element {...config} control={control} />
						</div>
					);
				})}
		</>
	);
}

export default forwardRef(EnrichmentField);
