import React from "react";

import SingleSelect from "../common/SingleSelect";
import useYesNoHandler from "../hooks/useYesNoHandler";

import styles from "./styles.module.scss";

function YesNo({ defaultValue = "", onChange = () => {} }) {
	const {
		value = "",
		handleChange = () => {},
		options = [],
		optionColourMapping = {},
	} = useYesNoHandler({
		defaultValue,
		onChange,
	});

	return (
		<div className={styles.yes_no_container}>
			<SingleSelect
				value={value}
				handleChange={handleChange}
				options={options}
				optionBackgroundColor={optionColourMapping}
			/>
		</div>
	);
}

export default YesNo;
