import React, { forwardRef, useImperativeHandle } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import zipCodeControls from "../../configuration/getZipCodeControls";
import useZipCode from "../../hooks/useZipCode";


function ZipCode({ value }, ref) {
	const { formHook } = useZipCode({ value });

	const {
		control,
		formState: { errors },
		handleSubmit,
	} = formHook || {};

	useImperativeHandle(ref, () => ({
		saveFormData() {
			return new Promise((resolve, reject) => {
				handleSubmit(
					(data) => resolve(data),
					(error) => reject(error),
				)();
			});
		},
	}));

	return zipCodeControls.map((config) => {
		const { name, label, type, showLabel = true } = config || {};
		const Element = getField(type);

		return (
			<div className="py-3 w-full box-border" key={name}>
				{showLabel ? <div className="mb-2 ml-2 text-[0.85rem]">{label}</div> : null}
				<Element {...config} control={control} />

				<ErrorLabel errors={errors} name={name} />
			</div>
		);
	});
}

export default forwardRef(ZipCode);
