import { forwardRef, useImperativeHandle } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import signatureControls from "../../configuration/getSingnatureControls";
import useSignatureSettings from "../../hooks/useSignatureSetting";
import styles from "../commonStyles/styles.module.scss";

const SignatureField = forwardRef(({ value = {} }, ref) => {
	const { formHook } = useSignatureSettings({
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

	return signatureControls.map((config) => {
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

export default SignatureField;
