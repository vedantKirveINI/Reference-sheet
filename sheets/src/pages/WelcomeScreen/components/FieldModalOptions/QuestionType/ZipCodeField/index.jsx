import React, { forwardRef, useImperativeHandle } from "react";

import getField from "../../../../../../form/getField";
import ErrorLabel from "../../common/ErrorLabel";
import zipCodeControls from "../../configuration/getZipCodeControls";
import useZipCode from "../../hooks/useZipCode";
import styles from "../commonStyles/styles.module.scss";

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
			<div className={styles.field_container} key={name}>
				{showLabel ? <div className={styles.label}>{label}</div> : null}
				<Element {...config} control={control} />

				<ErrorLabel errors={errors} name={name} />
			</div>
		);
	});
}

export default forwardRef(ZipCode);
