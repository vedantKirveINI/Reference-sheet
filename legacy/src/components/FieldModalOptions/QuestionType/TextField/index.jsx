import { forwardRef, useImperativeHandle } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import defaultControls from "../../configuration/getDefaultControls";
import useTextSettings from "../../hooks/useTextSettings";
import styles from "../commonStyles/styles.module.scss";

const StringField = forwardRef(({ value = {}, childControlRef }, ref) => {
	const { formHook } = useTextSettings({
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
					(data) => resolve(data),
					(error) => reject(error),
				)();
			});
		},
	}));

	return defaultControls.map((config) => {
		const { name, label, type } = config || {};
		const Element = getField(type);

		return (
			<div className={styles.field_container} key={name}>
				<div className={styles.label}>{label}</div>
				<Element
					{...config}
					control={control}
					ref={(el) => {
						if (childControlRef) {
							if (!childControlRef.current) {
								ref.current = {}; // Ensure it's initialized
							}
							childControlRef.current[name] = el;
						}
					}}
				/>

				<ErrorLabel errors={errors} name={name} />
			</div>
		);
	});
});

export default StringField;
