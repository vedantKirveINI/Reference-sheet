import { forwardRef, useImperativeHandle, useMemo } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import controls from "../../configuration/getTimeControls";
import useTimeSettings from "../../hooks/useTimeSettings";
import formatTimeData from "../../utils/formatTimeData";
import { calculateWidth } from "../../utils/getWidthFromSpan";
import styles from "../commonStyles/styles.module.scss";

const TimeField = forwardRef(({ value = {} }, ref) => {
	const { formHook } = useTimeSettings({
		value,
	});

	const {
		formState: { errors },
		control,
		handleSubmit,
		setError,
		watch,
	} = formHook;

	const isTwentyFourHour = watch("isTwentyFourHour");

	const updatedControls = useMemo(() => {
		return controls.map((control) => {
			if (control?.question) {
				return {
					...control,
					question: {
						...control.question,
						settings: {
							...control.question?.settings,
							isTwentyFourHour: isTwentyFourHour,
						},
					},
				};
			}
			return control;
		});
	}, [isTwentyFourHour]);

	useImperativeHandle(ref, () => ({
		saveFormData() {
			return new Promise((resolve, reject) => {
				handleSubmit(
					(formData) => {
						const { isError, data } = formatTimeData({ formData });

						if (isError) {
							setError("defaultTime", {
								message: data.msg,
							});

							reject(data.msg);
						}

						resolve(data);
					},
					(error) => {
						reject(error);
					},
				)();
			});
		},
	}));

	return updatedControls.map((config) => {
		const { name, label, type, span } = config || {};
		const Element = getField(type);

		const width = calculateWidth(span);

		return (
			<div
				style={{ width: width }}
				className={`${styles.field_container}`}
				key={name}
			>
				{type !== "switch" ? (
					<div className={styles.label}>{label}</div>
				) : (
					<></>
				)}
				<Element {...config} control={control} />

				<ErrorLabel errors={errors} name={name} />
			</div>
		);
	});
});

export default TimeField;
