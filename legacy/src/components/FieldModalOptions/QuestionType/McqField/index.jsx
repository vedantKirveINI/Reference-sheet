import ODSIcon from "@/lib/oute-icon";
import React, { forwardRef, useImperativeHandle } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import useMcqSettings from "../../hooks/useMcqSettings";


const McqField = forwardRef(({ value = {}, controlErrorRef = {} }, ref) => {
	const { formHook, updatedControls, getAppendValue } = useMcqSettings({
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
								<div className="flex gap-1.5 items-center pr-1.5">
									<div
										data-testid="draggable-element"
										className="flex items-center cursor-grab p-0.5"
									>
										<ODSIcon
											outeIconName="OUTEDragIcon"
											outeIconProps={{
												className: "text-[#9ca3af] w-3 h-3 cursor-grab",
											}}
										/>
									</div>
									<div
										data-testid="delete-element"
										className="flex items-center cursor-pointer p-0.5 rounded transition-colors duration-150 hover:bg-red-100"
									>
										<ODSIcon
											outeIconName="OUTECloseIcon"
											outeIconProps={{
												className: "text-[#9ca3af] w-3 h-3 cursor-pointer transition-colors duration-150 hover:text-red-600",
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
			<div className="py-3 w-full box-border" key={name}>
				<div className="mb-2 ml-2 text-[0.85rem]">{label}</div>
				<Element
					{...config}
					ref={
						type === "fieldArray"
							? controlErrorRef
							: (ele) => {
									if (ele && controlErrorRef?.current) {
										controlErrorRef.current[name] = ele;
									}
								}
					}
					control={control}
					errors={errors}
					getAppendValue={getAppendValue}
				/>

				{type !== "fieldArray" && (
					<ErrorLabel errors={errors} name={name} />
				)}
			</div>
		);
	});
});

export default McqField;
