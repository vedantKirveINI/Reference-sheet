import ODSIcon from "@/lib/oute-icon";
import { Input } from "@/components/ui/input";
import { forwardRef, useImperativeHandle, useRef } from "react";

import { FIELD_OPTIONS_MAPPING } from "../../../../../../../constants/fieldOptionsMapping.js";
import QUESTION_TYPE_ICON_MAPPING from "@/constants/questionTypeIconMapping";
import getField from "../../../../../../../common/forms/getField";
import convertBytes from "../../../../../../../utils/sizeConversion.js";
import ErrorLabel from "../../../../../../../common/forms/ErrorLabel";

import FieldArray from "./FieldArray";
import { useFieldConfigurationForm } from "./hooks/useFieldConfigurationForm";
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
		<div className="bg-white rounded-[1.125rem] px-7 py-9 max-h-[60vh] overflow-y-auto">
			<div className="flex items-center justify-start gap-3 p-3 rounded-lg mb-8 border border-[#e3e8ef] w-full box-border">
				<div className="flex items-center gap-2 text-black text-base min-w-0">
					<ODSIcon
						outeIconName="XlsxIcon"
						outeIconProps={{
							className: "h-9 w-9",
						}}
					/>
					<div className="text-base whitespace-nowrap overflow-hidden text-ellipsis">
						{formData.fileName || "File"}
					</div>
				</div>
				<div className="text-[#607d8b] text-[0.95rem] font-medium ml-auto min-w-0 shrink-0">
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
						<div className="mt-6">
							<div className="text-[#263238] font-[var(--tt-font-family)] text-[1.15rem] font-medium mb-1">
								Field configuration
							</div>
							<div className="text-[#546e7a] font-[var(--tt-font-family)] text-base font-normal leading-6 mt-3.5">
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
						<div className="py-8 pb-4 border-t-[0.0469rem] border-b-[0.0469rem] border-[#cfd8dc]">
							<p className="text-base font-medium text-[#263238] m-0 mb-4">{label || ""}</p>
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
