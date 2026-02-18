import { Error } from "@/lib/error-display";
import React from "react";

function ErrorLabel({ errors, name, label = "field" }) {
	if (!errors?.[name]) {
		return null;
	}

	return (
		<Error className="text-xs py-1">
			{errors[name].message || `${label} is required`}
		</Error>
	);
}

export default ErrorLabel;
