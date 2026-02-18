import { forwardRef, useImperativeHandle } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import useRatingSettings from "../../hooks/useRatingSettings";


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
			<div className="py-3 w-full box-border" key={name}>
				<div className="mb-2 ml-2 text-[0.85rem]">{label}</div>
				<Element {...config} control={control} />

				<ErrorLabel errors={errors} name={name} />
			</div>
		);
	});
});

export default RatingField;
