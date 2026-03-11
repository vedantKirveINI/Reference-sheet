import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";

import getField from "../../../../../../../common/forms/getField";
import ErrorLabel from "../../../../../../../common/forms/ErrorLabel";

import styles from "./styles.module.scss";

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
					<div key={name} className={styles.table_content}>
						<p className={styles.table_label}>{label || ""}</p>
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
