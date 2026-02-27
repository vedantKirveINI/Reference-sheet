import { forwardRef, useImperativeHandle, memo } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import useCreatedTimeSettings from "../../hooks/useCreatedTimeSettings";
import styles from "../commonStyles/styles.module.scss";

const CreatedTimeField = forwardRef(({ value = {} }, ref) => {
	const {
		handleSubmit = () => {},
		control = {},
		errors = {},
		controls = [],
	} = useCreatedTimeSettings({
		value,
	});

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
				{type !== "switch" && (
					<div className={styles.label}>{label}</div>
				)}

				<Element {...config} control={control} />

				<ErrorLabel errors={errors} name={name} />
			</div>
		);
	});
});

export default memo(CreatedTimeField);
