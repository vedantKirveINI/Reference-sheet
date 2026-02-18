import isEmpty from "lodash/isEmpty";
import ODSIcon from "@/lib/oute-icon";
import { forwardRef, useImperativeHandle } from "react";

import { FIELD_OPTIONS_MAPPING } from "@/constants/fieldOptionsMapping";
import { NEW_LABEL_BADGE_ICON } from "@/constants/Icons/commonIcons";
import QUESTION_TYPE_ICON_MAPPING from "@/constants/questionTypeIconMapping";
import getField from "@/common/forms/getField";
import ErrorLabel from "@/components/FieldModalOptions/common/ErrorLabel";
import FormulaField from "../FormulaField";
import useAddFieldContentHandler from "../hooks/useAddFieldContentHandler";

const AddFieldContent = ({ value = {}, fields = [] }, ref) => {
	const {
		RenderSelectedField,
		addFieldRef,
		control,
		errors,
		handleSubmit,
		controls,
		parentControlRef,
		controlErrorRef,
		selectValue,
		currentFieldId,
	} = useAddFieldContentHandler({ value });

	useImperativeHandle(
		ref,
		() => ({
			async saveFormData() {
				let mainFormData = {};
				let childFormData = {};
				let mainFormError = {};
				let childFormError = {};

				try {
					mainFormData = await new Promise((resolve, reject) => {
						handleSubmit(
							(data) => resolve(data),
							(error) => reject(error),
						)();
					});
				} catch (error) {
					mainFormError = error;
				}

				if (addFieldRef.current?.saveFormData) {
					try {
						childFormData =
							await addFieldRef.current.saveFormData();
					} catch (error) {
						childFormError = error;
					}
				}

				if (!isEmpty(mainFormError) && parentControlRef?.current) {
					const firstErrorField = Object.keys(mainFormError)[0];

					if (parentControlRef.current[firstErrorField]) {
						parentControlRef.current[
							firstErrorField
						].scrollIntoView({
							behavior: "smooth",
							block: "center",
						});
					}
				} else if (
					!isEmpty(childFormError) &&
					controlErrorRef?.current
				) {
					let firstErrorField = Object.keys(childFormError)[0];
					const values = childFormError[firstErrorField];

					if (Array.isArray(values) && values.length > 0) {
						for (let index = 0; index < values.length; index++) {
							const fieldError = values[index];

							if (!isEmpty(fieldError)) {
								const childFieldErrorKey =
									Object.keys(fieldError)[0];
								const fieldRef =
									controlErrorRef.current?.[
										firstErrorField
									]?.[index]?.[childFieldErrorKey];

								if (fieldRef) {
									fieldRef.scrollIntoView({
										behavior: "smooth",
										block: "center",
									});
								}
								break;
							}
						}
					} else if (
						firstErrorField &&
						controlErrorRef.current[firstErrorField]
					) {
						controlErrorRef.current[firstErrorField].scrollIntoView(
							{
								behavior: "smooth",
								block: "center",
							},
						);
					}
				}

				if (!isEmpty(mainFormError) || !isEmpty(childFormError)) {
					throw new Error("Form validation failed");
				}

				return { ...mainFormData, ...childFormData };
			},
		}),
		[addFieldRef, handleSubmit],
	);

	return (
		<div className="py-5 px-6 max-h-[50vh] overflow-auto bg-white scrollbar-thin">
			{controls.map((config) => {
				const { name, label, type } = config || {};

				const Element = getField(type);

				if (name === "type") {
					config = {
						...config,
						renderOption: (props, option, { selected }) => {
							const { key, ...rest } = props;

							return (
								<li
									data-testid={option?.value}
									key={key}
									{...rest}
									className={`flex gap-2 cursor-pointer ${option?.value === "ENRICHMENT" ? "flex-shrink-0 h-24" : ""}`}
								>
									<div className="flex items-center gap-3 w-full">
										<ODSIcon
											imageProps={{
												src: QUESTION_TYPE_ICON_MAPPING[
													option?.value
												],
												className: `w-[1.125rem] h-[1.125rem] flex-shrink-0 ${selected ? "invert brightness-[1000%]" : ""}`,
											}}
										/>
										<div className="flex flex-col gap-1 flex-1">
											<div className="flex items-center gap-2 font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]">
												<span
													className={`text-[0.8125rem] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] ${selected ? "font-medium text-white" : "font-normal text-[#1f2937]"}`}
												>
													{option?.label}
												</span>

												{option?.value ===
													"ENRICHMENT" && (
													<ODSIcon
														imageProps={{
															src: NEW_LABEL_BADGE_ICON,
														}}
													/>
												)}
											</div>
											{option?.value === "ENRICHMENT" && (
												<span
													className={`text-xs leading-5 font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] ${selected ? "text-white/90" : "text-[#6b7280]"}`}
												>
													Choose from a set of
													predefined enhancements to
													quickly improve your data.
												</span>
											)}
										</div>
									</div>
								</li>
							);
						},
						renderInput: (params) => {
							const option = FIELD_OPTIONS_MAPPING.find(
								(option) =>
									option.label === params.inputProps.value,
							);

							return (
								<div
									data-testid="select-field-type"
									className="relative"
								>
									<div className="flex items-center gap-2 w-full border border-[#d1d5db] rounded-md bg-white hover:bg-[#fafafa] focus-within:bg-white focus-within:border-[#1f2937] focus-within:border-2 transition-all duration-200">
										{QUESTION_TYPE_ICON_MAPPING[option?.value] && (
											<ODSIcon
												imageProps={{
													src: QUESTION_TYPE_ICON_MAPPING[option.value],
													className: "w-[1.125rem] h-[1.125rem] flex-shrink-0 ml-3",
												}}
											/>
										)}
										<input
											{...params.inputProps}
											className="flex-1 text-[0.8125rem] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] py-2 px-3 text-[#1f2937] border-none outline-none bg-transparent"
										/>
										{params.InputProps?.endAdornment}
									</div>
								</div>
							);
						},
					};
				}

				const enhancedConfig = config;

				return (
					<div className="mb-5 transition-[margin-bottom] duration-200" key={name}>
						<p className="m-0 mb-2 text-[#1f2937] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[0.85rem] font-medium leading-[1.125rem] tracking-[-0.01em] select-none normal-case">
							{label || ""}
						</p>
						<Element
							{...enhancedConfig}
							errors={errors}
							control={control}
							ref={(el) => (parentControlRef.current[name] = el)}
						/>
						<ErrorLabel errors={errors} name={name} />
					</div>
				);
			})}

			{selectValue?.value === "FORMULA" ? (
				<div className="w-full border-t-2 border-[#e5e7eb] pt-4 mt-5 h-fit animate-[fadeIn_0.25s_cubic-bezier(0.4,0,0.2,1)]">
					<FormulaField
						fields={fields.filter(
							(field) => field.id !== currentFieldId,
						)}
						value={value}
						ref={addFieldRef}
						controlErrorRef={controlErrorRef}
					/>
				</div>
			) : (
				<div className="w-full border-t-2 border-[#e5e7eb] pt-4 mt-5 h-fit animate-[fadeIn_0.25s_cubic-bezier(0.4,0,0.2,1)]">
					{RenderSelectedField && (
						<RenderSelectedField
							value={value}
							ref={addFieldRef}
							controlErrorRef={controlErrorRef}
							fields={
								selectValue?.value === "ENRICHMENT" && fields
							}
						/>
					)}
				</div>
			)}
		</div>
	);
};

export default forwardRef(AddFieldContent);
