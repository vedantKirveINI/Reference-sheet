import TextField from "oute-ds-text-field";
import { forwardRef, useImperativeHandle } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import YES_NO_OPTIONS from "../../constants";
import useYesNoSettings from "../../hooks/useYesNoSettings";

import styles from "./styles.module.scss";

const YesNoField = forwardRef(({ value = {}, controlErrorRef = {} }, ref) => {
	const { formHook = {}, controls = [] } = useYesNoSettings({
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
					(data) => {
						const { options, ...rest } = data;

						const transformedData = {
							...rest,
							defaultChoice: data?.defaultChoice?.label || "",
						};

						resolve(transformedData);
					},
					(error) => {
						reject(error);
					},
				)();
			});
		},
	}));

	return (
		<>
			<div className={styles.yes_no_textfield}>
				{YES_NO_OPTIONS.map((option) => {
					return (
						<TextField
							key={option.id}
							value={option.label}
							disabled
						/>
					);
				})}
			</div>

			{controls.map((config) => {
				const { name, label, type } = config || {};
				const Element = getField(type);

				return (
					<div key={name} className={styles.field_container}>
						{type !== "switch" && (
							<div className={styles.label}>{label}</div>
						)}

						<Element
							{...config}
							control={control}
							ref={(ele) => {
								if (ele && controlErrorRef?.current) {
									controlErrorRef.current[name] = ele;
								}
							}}
						/>

						<ErrorLabel errors={errors} name={name} />
					</div>
				);
			})}
		</>
	);
});

export default YesNoField;
