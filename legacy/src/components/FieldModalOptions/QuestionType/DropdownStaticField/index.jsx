import ODSIcon from "oute-ds-icon";
import React, { forwardRef, useImperativeHandle } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import useDropdownStaticSettings from "../../hooks/useDropdownStaticSettings";
import styles from "../commonStyles/styles.module.scss";

const DropdownStaticField = forwardRef(
	({ value = {}, controlErrorRef = {} }, ref) => {
		const { formHook, updatedControls, getAppendValue } =
			useDropdownStaticSettings({
				value,
			});

		const {
			handleSubmit,
			control,
			formState: { errors },
		} = formHook;

		useImperativeHandle(
			ref,
			() => ({
				saveFormData() {
					return new Promise((resolve, reject) => {
						handleSubmit(
							(data) => {
								const transformedData = {
									...data,
									options: data.options.map(
										(option) => option?.label,
									),
									defaultValue: data.defaultValue.map(
										(option) => option?.label,
									),
								};
								resolve(transformedData);
							},
							(error) => {
								reject(error);
							},
						)();
					});
				},
			}),
			[handleSubmit],
		);

		return updatedControls.map((config) => {
			const { name, label, type, controls } = config || {};

			if (name === "options") {
				config.controls = controls.map((control) => {
					if (control.name === "label") {
						return {
							...control,
							InputProps: {
								...control.InputProps,
								endAdornment: (
									<div
										style={{
											display: "flex",
											gap: "0.375rem",
											alignItems: "center",
											paddingRight: "0.375rem",
										}}
									>
										<div
											data-testid="draggable-element"
											style={{
												display: "flex",
												alignItems: "center",
												cursor: "grab",
												padding: "0.125rem",
											}}
										>
											<ODSIcon
												outeIconName="OUTEDragIcon"
												outeIconProps={{
													sx: {
														color: "#9ca3af",
														width: "0.75rem",
														height: "0.75rem",
														cursor: "grab",
													},
												}}
											/>
										</div>
										<div
											data-testid="delete-element"
											style={{
												display: "flex",
												alignItems: "center",
												cursor: "pointer",
												padding: "0.125rem",
												borderRadius: "0.25rem",
												transition:
													"background-color 0.15s ease",
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor =
													"#fee2e2";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor =
													"transparent";
											}}
										>
											<ODSIcon
												outeIconName="OUTECloseIcon"
												outeIconProps={{
													sx: {
														color: "#9ca3af",
														width: "0.75rem",
														height: "0.75rem",
														cursor: "pointer",
														transition:
															"color 0.15s ease",
													},
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.color =
														"#dc2626";
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.color =
														"#9ca3af";
												}}
											/>
										</div>
									</div>
								),
							},
						};
					}
					return control;
				});
			}

			const Element = getField(type);

			return (
				<div className={styles.field_container} key={name}>
					<div className={styles.label}>{label}</div>
					<Element
						{...config}
						control={control}
						errors={errors}
						ref={
							type === "fieldArray"
								? controlErrorRef
								: (ele) => {
										if (ele && controlErrorRef?.current) {
											controlErrorRef.current[name] = ele;
										}
									}
						}
						getAppendValue={getAppendValue}
					/>

					{type !== "fieldArray" && (
						<ErrorLabel errors={errors} name={name} />
					)}
				</div>
			);
		});
	},
);

export default DropdownStaticField;
