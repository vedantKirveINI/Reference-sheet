import React, { forwardRef, useImperativeHandle } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import controls from "../../configuration/getPhoneNumberControls";
import usePhoneNumberSettings from "../../hooks/usePhoneNumberSettings";
import styles from "../commonStyles/styles.module.scss";

const PhoneNumberField = forwardRef(({ value = {} }, ref) => {
	const { formHook } = usePhoneNumberSettings({
		value,
	});

	const {
		formState: { errors },
		handleSubmit,
		control,
	} = formHook;

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

	return controls.map((config) => {
		const { name, label, type } = config || {};
		const Element = getField(type);

		return (
			<div className={styles.field_container} key={name}>
				<div className={styles.label}>{label}</div>
				<Element {...config} control={control} />

				<ErrorLabel errors={errors} name={name} />
			</div>
		);
	});
});

export default PhoneNumberField;
