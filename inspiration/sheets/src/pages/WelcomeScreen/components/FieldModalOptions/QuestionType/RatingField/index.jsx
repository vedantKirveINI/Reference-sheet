import { forwardRef, useImperativeHandle } from "react";

import getField from "../../../../../../form/getField";
import ErrorLabel from "../../common/ErrorLabel";
import useRatingSettings from "../../hooks/useRatingSettings";
import styles from "../commonStyles/styles.module.scss";

const RatingField = forwardRef(({ value = {} }, ref) => {
	const { controls, errors, handleSubmit, control } = useRatingSettings({
		value,
	});

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

export default RatingField;
