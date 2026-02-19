import React, { forwardRef, useImperativeHandle, memo } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import useDateSettings from "../../hooks/useDateSettings";
import styles from "../commonStyles/styles.module.scss";

const DateField = forwardRef(({ value = {} }, ref) => {
	const { formHook, controls } = useDateSettings({
		value,
	});

	const {
		formState: { errors },
		control,
		handleSubmit,
	} = formHook;

	useImperativeHandle(ref, () => ({
		saveFormData() {
			return new Promise((resolve, reject) => {
				handleSubmit(
					(data) => {
						const { defaultValue } = data || {};
						const payload = {
							...data,
							defaultValue: defaultValue?.ISOValue,
						};

						resolve(payload);
					},
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
				{type !== "switch" ? (
					<div className={styles.label}>{label}</div>
				) : null}

				<Element {...config} control={control} />

				<ErrorLabel errors={errors} name={name} />
			</div>
		);
	});
});

export default memo(DateField);
