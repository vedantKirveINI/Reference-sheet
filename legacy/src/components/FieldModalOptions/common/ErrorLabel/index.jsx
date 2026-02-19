import React from "react";

function ErrorLabel({ errors, name, label = "field" }) {
	if (!errors?.[name]) {
		return null;
	}

	return (
		<span
			style={{
				fontSize: "0.75rem",
				padding: "0.25rem 0rem",
				color: "#d32f2f",
			}}
		>
			{errors[name].message || `${label} is required`}
		</span>
	);
}

export default ErrorLabel;
