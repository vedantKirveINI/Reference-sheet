function getRatingCustomSx({ showEditorBorder = false }) {
	const autoCompleteSx = {
		width: "100%",
		"& .MuiInputBase-root": {
			background: "transparent",
			borderRadius: 0,
			padding: "0px 0px 0px 7px !important", // in px to maintain alignment across different screen sizes
		},

		"& .MuiTextField-root": {
			height: "100%",
		},

		"& .MuiAutocomplete-input": {
			fontSize: "var(--cell-font-size)",
			fontFamily: "var(--tt-font-family)",
			letterSpacing: "0.1px",
		},

		"& .MuiOutlinedInput-root": {
			width: "auto",
			height: "100%",
			border: showEditorBorder ? "2px solid #212121" : "none",

			"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
				borderColor: "transparent",
				borderWidth: "0",
			},

			"&:hover .MuiOutlinedInput-notchedOutline": {
				borderColor: "rgba(0, 0, 0, 0)",
			},

			"& .MuiOutlinedInput-notchedOutline": {
				borderColor: "rgba(0, 0, 0, 0)",
			},
		},
	};
	return {
		autoCompleteSx,
	};
}

export default getRatingCustomSx;
