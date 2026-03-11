import React from "react";

const CircularLoader = () => {
	return (
		<div
			style={{
				margin: "0 0.1875rem",
				height: "1.25rem",
				cursor: "unset",
			}}
		>
			<div
				style={{
					border: "0.25rem solid rgba(0, 0, 0, 0.1)",
					borderLeftColor: "white",
					borderRadius: "50%",
					width: "1.25rem",
					height: "1.25rem",
					animation: "spin 1s linear infinite",
				}}
			/>
		</div>
	);
};

export default CircularLoader;
