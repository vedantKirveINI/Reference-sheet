import { forwardRef, useImperativeHandle } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import useListSettings from "../../hooks/useListSettings";
import styles from "../commonStyles/styles.module.scss";

const ListField = forwardRef(({ value = {}, controlErrorRef = {} }, ref) => {
	const { formHook, updatedControls } = useListSettings({
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
		const { name, label, type } = config || {};

		const Element = getField(type);

		return (
			<div className={styles.field_container} key={name}>
				<div className={styles.label}>{label}</div>
				<Element
					{...config}
					ref={(ele) => {
						if (ele && controlErrorRef?.current) {
							controlErrorRef.current[name] = ele;
						}
					}}
					control={control}
					errors={errors}
				/>

				<ErrorLabel errors={errors} name={name} />
			</div>
		);
	});
});

export default ListField;
