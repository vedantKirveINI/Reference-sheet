import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";
import ODSTextField from "oute-ds-text-field";
import { forwardRef, useImperativeHandle, useRef } from "react";

import QUESTION_TYPE_ICON_MAPPING from "../../../../../../../constants/questionTypeIconMapping";
import getField from "../../../../../../../form/getField";
import convertBytes from "../../../../../../../utils/sizeConversion";
import ErrorLabel from "../../../../FieldModalOptions/common/ErrorLabel";

import FieldArrayController from "./FieldArray";
import { useFieldConfigurationExistingTableForm } from "./hooks/useFieldConfigurationExistingTableForm";
import styles from "./styles.module.scss";
import transformFormData from "./utils/transformFormData";

function getTransformedControls({ controls = [], fields = [] }) {
	return controls.map((controlConfig) => {
		if (controlConfig.name === "type") {
			return {
				...controlConfig,
				renderOption: (props, option, { selected }) => {
					const { key, ...rest } = props;

					const fieldOption = [
						...fields,
						{
							name: "Create new field",
							type: "ADD",
						},
					].find((field) => field?.name === option?.label);

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
									src: QUESTION_TYPE_ICON_MAPPING?.[
										fieldOption?.type
									],
									className: selected
										? styles.selected_option_icon
										: styles.option_icon,
								}}
							/>
							{option?.label}
						</li>
					);
				},
				renderInput: (params) => {
					const option = [
						...fields,
						{
							name: "Create new field",
							type: "ADD",
						},
					].find((field) => field?.name === params.inputProps?.value);

					return (
						<ODSTextField
							{...params}
							className="black"
							InputProps={{
								...params.InputProps,
								startAdornment: QUESTION_TYPE_ICON_MAPPING[
									option?.type
								] && (
									<ODSIcon
										imageProps={{
											src: QUESTION_TYPE_ICON_MAPPING[
												option.type
											],
											className: styles.option_icon,
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
		return controlConfig;
	});
}

function FieldConfigurationExistingTable(
	{ formData = {}, tableInfo = {} },
	ref,
) {
	const {
		control = {},
		handleSubmit = () => {},
		controls = [],
		errors = {},
		filteredTableFields = [],
	} = useFieldConfigurationExistingTableForm({ formData, tableInfo });

	const fieldArrayRef = useRef();

	useImperativeHandle(ref, () => ({
		saveFormData: () =>
			new Promise((resolve, reject) => {
				handleSubmit(
					(data) => {
						// transform the data
						const transformedData = {
							...data,
							columnsInfo: transformFormData({
								formData: data,
								fields: filteredTableFields,
							}),
						};

						// Final data transformation goes here if needed
						resolve(transformedData);
					},
					(error) => {
						const errorFieldArrayKey = "map_fields"; // Adjust based on actual name
						const fieldArrayErrors = error?.[errorFieldArrayKey];

						if (
							fieldArrayErrors &&
							Array.isArray(fieldArrayErrors)
						) {
							// Find the first index and field that contains an error
							const indexWithError = fieldArrayErrors.findIndex(
								(field) =>
									field && Object.keys(field).length > 0,
							);

							if (indexWithError !== -1) {
								const fieldError =
									fieldArrayErrors[indexWithError];
								const firstErrorFieldKey =
									Object.keys(fieldError)[0];

								const el =
									fieldArrayRef.current?.[
										errorFieldArrayKey
									]?.[indexWithError]?.[firstErrorFieldKey];

								if (el?.scrollIntoView) {
									el.scrollIntoView({
										behavior: "smooth",
										block: "center",
									});
								}
							}
						}
						reject(error);
					},
				)();
			}),
		addField: fieldArrayRef.current?.addField,
	}));

	return (
		<div className={styles.container}>
			<div className={styles.upload_info_container}>
				<div className={styles.uploaded_file_name}>
					<ODSIcon
						outeIconName="XlsxIcon"
						outeIconProps={{
							sx: { height: "1.5rem", width: "1.5rem" },
						}}
					/>
					<div className={styles.file_name_text}>
						{formData.fileName || "File"}
					</div>
				</div>
				<div className={styles.uploaded_file_size}>
					{formData.uploadedFileInfo?.size
						? convertBytes({
								bytes: formData.uploadedFileInfo.size,
							})
						: "-"}
				</div>
			</div>

			<div className={styles.map_csv_field_container}>
				<div className={styles.config_container}>
					{isEmpty(controls) ? (
						<div className={styles.empty_map}>
							No fields remaining to map...
						</div>
					) : (
						(controls || []).map((config) => {
							const { name, type, label, controls } =
								config || {};

							if (type === "fieldArray") {
								const updatedControls = getTransformedControls({
									controls,
									fields: filteredTableFields,
								});

								return (
									<div
										className={
											styles.field_config_container
										}
									>
										<div className={styles.field_config}>
											Field configuration
										</div>
										<div
											className={
												styles.field_config_description
											}
										>
											Map appropriate data types to each
											field imported from a file to ensure
											accurate data processing and
											validation.
										</div>
										<FieldArrayController
											key={name}
											{...config}
											controls={updatedControls}
											control={control}
											errors={errors}
											ref={fieldArrayRef}
										/>
									</div>
								);
							} else {
								const Element = getField(type);

								return (
									<div className={styles.radio_config}>
										<p className={styles.field_label}>
											{label || ""}
										</p>
										<Element
											key={name}
											{...config}
											control={control}
											errors={errors}
										/>
										<ErrorLabel
											errors={errors}
											name={name}
										/>
									</div>
								);
							}
						})
					)}
				</div>
			</div>
		</div>
	);
}

export default forwardRef(FieldConfigurationExistingTable);
