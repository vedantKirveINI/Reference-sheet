import { Error } from "@oute/oute-ds.atom.error";
import React from "react";

function ErrorLabel({ errors, name, label = "field" }) {
	if (!errors?.[name]) {
		return null;
	}

	return (
		<Error
			text={errors[name].message || `${label} is required`}
			style={{
				fontSize: "0.75rem",
				padding: "0.25rem 0rem",
			}}
		/>
	);
}

export default ErrorLabel;
