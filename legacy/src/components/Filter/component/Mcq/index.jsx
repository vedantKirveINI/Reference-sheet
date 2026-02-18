import React from "react";
import MultiSelect from "@/components/MultiSelect";

import useMcqHandler from "../hooks/useMcqHandler";

function Mcq(props) {
	const {
		value = [],
		options = [],
		handleSelectOption = () => {},
	} = useMcqHandler(props);

	return (
		<MultiSelect
			value={value}
			options={options}
			onChange={handleSelectOption}
			maxWidth={32}
		/>
	);
}

export default Mcq;
