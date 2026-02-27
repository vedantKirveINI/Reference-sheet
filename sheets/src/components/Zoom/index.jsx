import ODSAutocomplete from "oute-ds-autocomplete";

import ZOOM_OPTIONS from "./constants/zoomOptions";

function Zoom({ zoomLevel = 100, setZoomLevel }) {
	return (
		<ODSAutocomplete
			data-testid="zoom-autocomplete"
			variant="black"
			value={ZOOM_OPTIONS.find((option) => option.value === zoomLevel)}
			options={ZOOM_OPTIONS}
			onChange={(e, val) => {
				setZoomLevel(val.value);
			}}
			hideBorders={true}
			getOptionLabel={(option) => option?.label}
			isOptionEqualToValue={(option, val) => option?.value === val?.value}
			sx={{
				width: "6rem",
				"& .MuiOutlinedInput-root": {
					gap: "0.375rem",
					padding: "0.25rem 0.5rem !important",
				},
				"& .MuiOutlinedInput-root:hover": {
					backgroundColor: "#eceff1",
					cursor: "pointer",
				},
			}}
			slotProps={{
				popper: {
					sx: {
						"& .MuiAutocomplete-option": {
							padding: "0.5rem 0.5rem !important",
						},
						marginTop: "0.5rem !important",
					},
				},
			}}
		/>
	);
}

export default Zoom;
