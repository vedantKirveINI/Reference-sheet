import isEmpty from "lodash/isEmpty";
import ODSIcon from "@/lib/oute-icon";
import { Input } from "@/components/ui/input";
import { forwardRef, useImperativeHandle, useMemo } from "react";

import { FIELD_OPTIONS_MAPPING } from "../../../../../../../constants/fieldOptionsMapping";
import QUESTION_TYPE_ICON_MAPPING from "../../../../../../../constants/questionTypeIconMapping";

import useMapDataType from "./hooks/useMapDataType";
import MapDataTypeFieldArray from "./MapDataTypeFieldArray";
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
								className="flex gap-2 py-3 px-2 cursor-pointer"
							>
								<ODSIcon
									imageProps={{
										src: QUESTION_TYPE_ICON_MAPPING?.[
											option?.value
										],
										className: selected
											? "w-5 h-5 invert brightness-[1000%]"
											: "w-5 h-5",
									}}
								/>
								{option?.label}
							</li>
						);
					},
					renderInput: (params) => {
						const option = FIELD_OPTIONS_MAPPING.find(
							(opt) => opt.label === params.inputProps?.value,
						);

						return (
							<div className="flex items-center gap-2">
								{QUESTION_TYPE_ICON_MAPPING[option?.value] && (
									<ODSIcon
										imageProps={{
											src: QUESTION_TYPE_ICON_MAPPING[
												option.value
											],
											className: "w-5 h-5",
										}}
									/>
								)}
								<Input
									{...params}
									className="text-base"
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
			className="bg-white rounded-[1.125rem] px-7 py-9 max-h-[40rem] overflow-y-auto"
			data-testid="map-csv-field"
		>
			<div className="text-[#263238] font-[var(--tt-font-family)] text-[1.15rem] font-medium mb-1">Field configuration</div>
			<div className="text-[#546e7a] font-[var(--tt-font-family)] text-base font-normal leading-6 mt-3.5">
				Map appropriate data types to each field imported from a file to
				ensure accurate data processing and validation.
			</div>

			{isEmpty(controls) ? (
				<div className="text-[#90a4ae] italic py-6 text-center">
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
