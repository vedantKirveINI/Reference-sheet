import React from "react";
import { forwardRef } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import styles from "../commonStyles/styles.module.scss";

function NumberFormComp({ controls, control, errors }, ref) {
	return controls.map((config) => {
		const { name, label, type } = config || {};
		const Element = getField(type);

		return (
			<div className={styles.field_container} key={name}>
				{type !== "switch" ? (
					<div className={styles.label}>{label}</div>
				) : (
					<></>
				)}
				<Element
					{...config}
					control={control}
					ref={(ele) => (ref.current[name] = ele)}
				/>

				<ErrorLabel errors={errors} name={name} />
			</div>
		);
	});
}

export default forwardRef(NumberFormComp);
