import { forwardRef, useImperativeHandle } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import useListSettings from "../../hooks/useListSettings";


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
			<div className="py-3 w-full box-border" key={name}>
				<div className="mb-2 ml-2 text-[0.85rem]">{label}</div>
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
