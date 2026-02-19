import React from "react";

function ErrorLabel({ errors, name, label = "field" }) {
	if (!errors?.[name]) {
		return null;
	}

	return (
		<p
			className="text-destructive"
			style={{
				fontSize: "0.75rem",
				padding: "0.25rem 0rem",
			}}
		>
			{errors[name].message || `${label} is required`}
		</p>
	);
}

export default ErrorLabel;
