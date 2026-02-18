import { forwardRef, useImperativeHandle } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import signatureControls from "../../configuration/getSingnatureControls";
import useSignatureSettings from "../../hooks/useSignatureSetting";


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
			<div className="py-3 w-full box-border" key={name}>
				<div className="mb-2 ml-2 text-[0.85rem]">{label}</div>
				<Element {...config} control={control} />

				<ErrorLabel errors={errors} name={name} />
			</div>
		);
	});
});

export default SignatureField;
