import { Input } from "@/components/ui/input";
import { FileSpreadsheet } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef } from "react";

import { FIELD_OPTIONS_MAPPING } from "../../../../../../../constants/fieldOptionsMapping.js";
import QUESTION_TYPE_ICON_MAPPING from "@/constants/questionTypeIconMapping";
import getField from "../../../../../../../common/forms/getField";
import convertBytes from "../../../../../../../utils/sizeConversion.js";
import ErrorLabel from "../../../../../../../common/forms/ErrorLabel";

import FieldArray from "./FieldArray";
import { useFieldConfigurationForm } from "./hooks/useFieldConfigurationForm";
import styles from "./styles.module.scss";
import { columnsInfoTransform } from "./utils/transformColumnsInfo";

function getTransformedControls({ controls = [] }) {
	return controls.map((controlConfig) => {
		if (controlConfig.name === "type") {
			return {
				...controlConfig,
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
							{QUESTION_TYPE_ICON_MAPPING?.[option?.value] && (
								<img
									src={QUESTION_TYPE_ICON_MAPPING[option.value]}
									className={selected ? styles.selected_option_icon : styles.option_icon}
									alt=""
								/>
							)}
							{option?.label}
						</li>
					);
				},
				renderInput: (params) => {
					const option = FIELD_OPTIONS_MAPPING.find(
						(opt) => opt.label === params.inputProps?.value,
					);
					return (
						<div style={{ position: "relative", display: "flex", alignItems: "center" }}>
							{QUESTION_TYPE_ICON_MAPPING[option?.value] && (
								<img
									src={QUESTION_TYPE_ICON_MAPPING[option.value]}
									className={styles.option_icon}
									alt=""
									style={{ position: "absolute", left: "8px", zIndex: 1 }}
								/>
							)}
							<Input
								{...params}
								{...params.inputProps}
								className="black"
								style={{
									fontSize: "1rem",
									paddingLeft: QUESTION_TYPE_ICON_MAPPING[option?.value] ? "2rem" : undefined,
								}}
							/>
						</div>
					);
				},
			};
		}
		return controlConfig;
	});
}

function FieldConfiguration({ formData = {} }, ref) {
	const { control, handleSubmit, controls, errors, firstRowAsHeaderWatcher } =
		useFieldConfigurationForm({ formData });

	const fieldArrayRef = useRef();

	useImperativeHandle(ref, () => ({
		saveFormData: () =>
			new Promise((resolve, reject) => {
				handleSubmit(
					(data) => {
						const transformedData = {
							...data,
							columnsInfo: columnsInfoTransform({
								data,
								firstRowAsHeader: data?.first_row_as_header,
							}),
						};

						resolve(transformedData);
					},
					(error) => {
						const errorFieldArrayKey = "fields";
						const fieldArrayErrors = error?.[errorFieldArrayKey];

						if (
							fieldArrayErrors &&
							Array.isArray(fieldArrayErrors)
						) {
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
					<FileSpreadsheet
						style={{ height: "2.25rem", width: "2.25rem", color: "#1B5E20" }}
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
			{(controls || []).map((config) => {
				const {
					name,
					type,
					label,
					controls: nestedControls,
				} = config || {};

				if (type === "fieldArray") {
					const updatedControls = getTransformedControls({
						controls: nestedControls,
					});

					return (
						<div className={styles.field_config_container}>
							<div className={styles.field_config}>
								Field configuration
							</div>
							<div className={styles.field_config_description}>
								Map appropriate data types to each field
								imported from a file to ensure accurate data
								processing and validation.
							</div>
							<FieldArray
								{...config}
								controls={updatedControls}
								control={control}
								errors={errors}
								ref={fieldArrayRef}
								parsedCSVData={formData.parsedCSVData}
								firstRowAsHeader={firstRowAsHeaderWatcher}
							/>
						</div>
					);
				} else {
					const Element = getField(type);

					return (
						<div className={styles.radio_config}>
							<p className={styles.field_label}>{label || ""}</p>
							<Element
								key={name}
								{...config}
								control={control}
								errors={errors}
							/>
							<ErrorLabel errors={errors} name={name} />
						</div>
					);
				}
			})}
		</div>
	);
}

export default forwardRef(FieldConfiguration);
