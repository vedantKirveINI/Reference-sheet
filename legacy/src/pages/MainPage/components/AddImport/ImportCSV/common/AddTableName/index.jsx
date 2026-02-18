import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";

import getField from "../../../../../../../common/forms/getField";
import ErrorLabel from "../../../../../../../common/forms/ErrorLabel";

const getTableControls = ({ handleSaveData = () => {} }) => {
	const controls = [
		{
			name: "table_name",
			label: "Table Name",
			placeholder: "Enter Table Name",
			type: "text",
			autoFocus: true,
			rules: {
				required: true,
			},
			onEnter: () => {
				handleSaveData();
			},
		},
	];

	return controls;
};

function AddTableName({ formData = {}, handleSaveData = () => {} }, ref) {
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			table_name: formData?.table_name,
		},
	});

	const controls = getTableControls({ handleSaveData });

	useImperativeHandle(
		ref,
		() => ({
			saveFormData() {
				return new Promise((resolve, reject) => {
					handleSubmit(
						(data) => resolve(data),
						(error) => reject(error),
					)();
				});
			},
		}),
		[handleSubmit],
	);

	return (
		<div>
			{controls.map((config) => {
				const { label, type, name } = config;

				const Element = getField(type);

				return (
					<div key={name} className="px-8 py-9 text-[color:var(--cell-text-primary-color)] font-inter text-[0.9rem]">
						<p className="m-0 mb-2 ml-3">{label || ""}</p>
						<Element
							{...config}
							control={control}
							errors={errors}
						/>

						<ErrorLabel errors={errors} name={name} label={label} />
					</div>
				);
			})}
		</div>
	);
}

export default forwardRef(AddTableName);
