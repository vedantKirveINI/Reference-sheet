import ODSIcon from "@/lib/oute-icon";
import React, { forwardRef, useImperativeHandle } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import useRankingSettings from "../../hooks/useRankingSettings";


const RankingField = forwardRef(({ value = {}, controlErrorRef = {} }, ref) => {
	const { formHook, updatedControls, getAppendValue } = useRankingSettings({
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
								options: data?.options,
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
								<div className="flex gap-3 items-center">
									<div data-testid="draggable-element">
										<ODSIcon outeIconName="OUTEDragIcon" />
									</div>
									<div data-testid="delete-element">
										<ODSIcon
											outeIconName="OUTECloseIcon"
											outeIconProps={{
												className: "text-[#90A4AE] w-[1.125rem] h-[1.125rem] cursor-pointer",
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

export default RankingField;
