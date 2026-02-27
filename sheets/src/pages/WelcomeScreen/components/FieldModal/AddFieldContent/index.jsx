import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import ODSTextField from "oute-ds-text-field";
import { forwardRef, useImperativeHandle } from "react";

import { FIELD_OPTIONS_MAPPING } from "../../../../../constants/fieldOptionsMapping";
import { NEW_LABEL_BADGE_ICON } from "../../../../../constants/Icons/commonIcons";
import QUESTION_TYPE_ICON_MAPPING from "../../../../../constants/questionTypeIconMapping";
import getField from "../../../../../form/getField";
import ErrorLabel from "../../FieldModalOptions/common/ErrorLabel";
import FormulaField from "../FormulaField";
import useAddFieldContentHandler from "../hooks/useAddFieldContentHandler";

import styles from "./styles.module.scss";

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
							(error) => reject(error), // Capture errors
						)();
					});
				} catch (error) {
					mainFormError = error; // Store the error instead of throwing
				}

				if (addFieldRef.current?.saveFormData) {
					try {
						childFormData =
							await addFieldRef.current.saveFormData();
					} catch (error) {
						childFormError = error; // Store child form error
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
									Object.keys(fieldError)[0]; // Get the first error key
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
								break; // Exit loop after finding the first valid error
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

				// If either form failed, throw an error after both have run
				if (!isEmpty(mainFormError) || !isEmpty(childFormError)) {
					throw new Error("Form validation failed");
				}

				return { ...mainFormData, ...childFormData };
			},
		}),
		[addFieldRef, handleSubmit],
	);

	return (
		<div className={styles.add_field_content}>
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
									style={{
										display: "flex",
										gap: "0.5rem",
										cursor: "pointer",

										...(option?.value === "ENRICHMENT" && {
											flexShrink: 0,
											height: "6rem",
										}),
									}}
								>
									<div className={styles.option_container}>
										<ODSIcon
											imageProps={{
												src: QUESTION_TYPE_ICON_MAPPING[
													option?.value
												],
												className: selected
													? styles.selected_option_icon
													: styles.option_icon,
											}}
										/>
										<div
											className={
												styles.option_label_container
											}
										>
											<div
												className={styles.option_label}
											>
												<ODSLabel
													variant="subtitle2"
													sx={{
														fontFamily: "Inter",
														fontWeight: "400",
													}}
													color={
														selected
															? "white"
															: "#263238"
													}
												>
													{option?.label}
												</ODSLabel>

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
												<ODSLabel
													variant="body2"
													color={
														selected
															? "white"
															: "#607D8B"
													}
												>
													Choose from a set of
													predefined enhancements to
													quickly improve your data.
												</ODSLabel>
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
								<ODSTextField
									data-testid="select-field-type"
									{...params}
									className="black"
									InputProps={{
										...params.InputProps,
										startAdornment:
											QUESTION_TYPE_ICON_MAPPING[
												option?.value
											] && (
												<ODSIcon
													imageProps={{
														src: QUESTION_TYPE_ICON_MAPPING[
															option.value
														],
														className:
															styles.option_icon,
													}}
												/>
											),
									}}
									sx={{
										"& .MuiInputBase-input": {
											fontSize: "0.875rem",
										},
									}}
								/>
							);
						},
					};
				}

				return (
					<div className={styles.label_container} key={name}>
						<p>{label || ""}</p>
						<Element
							{...config}
							errors={errors}
							control={control}
							ref={(el) => (parentControlRef.current[name] = el)}
						/>
						<ErrorLabel errors={errors} name={name} />
					</div>
				);
			})}

			{selectValue?.value === "FORMULA" ? (
				<div className={styles.config_container}>
					<FormulaField
						fields={fields.filter(
							(field) => field.id !== currentFieldId, // Don't show current field in formula field options
						)}
						value={value}
						ref={addFieldRef}
						controlErrorRef={controlErrorRef}
					/>
				</div>
			) : (
				<div className={styles.config_container}>
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
