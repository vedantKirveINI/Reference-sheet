import isEmpty from "lodash/isEmpty";
import { Input } from "@/components/ui/input";
import { forwardRef, useImperativeHandle, useMemo } from "react";

import { FIELD_OPTIONS_MAPPING } from "../../../../../../../constants/fieldOptionsMapping";
import QUESTION_TYPE_ICON_MAPPING from "../../../../../../../constants/questionTypeIconMapping";

import useMapDataType from "./hooks/useMapDataType";
import MapDataTypeFieldArray from "./MapDataTypeFieldArray";
import styles from "./styles.module.scss";
import { transformMappedData } from "./utils/transformMappedDataType";

function getTransformedControls(controls = []) {
	return controls.map((config) => {
		const { controls: innerControls = [] } = config;

		const updatedControls = innerControls.map((controlConfig) => {
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

		return {
			...config,
			controls: updatedControls,
		};
	});
}

function MapDataType({ formData = {} }, ref) {
	const {
		control = {},
		controls = [],
		errors = {},
		handleSubmit = () => {},
	} = useMapDataType({
		formData,
	});

	const { columnsInfo = [], first_row_as_header = "" } = formData || {};

	useImperativeHandle(
		ref,
		() => ({
			saveFormData() {
				return new Promise((resolve, reject) => {
					handleSubmit(
						(data) => {
							const newData = transformMappedData({
								columnsInfo,
								data,
								firstRowAsHeader: first_row_as_header,
							});

							return resolve({
								columnsInfo: newData,
							});
						},
						(error) => {
							reject(error);
						},
					)();
				});
			},
		}),
		[columnsInfo, first_row_as_header, handleSubmit],
	);

	const transformedControls = useMemo(() => {
		return getTransformedControls(controls);
	}, [controls]);

	return (
		<div
			className={styles.map_csv_field_container}
			data-testid="map-csv-field"
		>
			<div className={styles.field_config}>Field configuration</div>
			<div className={styles.field_config_description}>
				Map appropriate data types to each field imported from a file to
				ensure accurate data processing and validation.
			</div>

			{isEmpty(controls) ? (
				<div className={styles.empty_map}>
					No fields remaining to map...
				</div>
			) : (
				transformedControls.map((config) => {
					return (
						<MapDataTypeFieldArray
							key={config.name}
							{...config}
							control={control}
							errors={errors}
						/>
					);
				})
			)}
		</div>
	);
}

export default forwardRef(MapDataType);
