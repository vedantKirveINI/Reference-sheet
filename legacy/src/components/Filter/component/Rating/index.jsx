import SingleSelect from "../common/SingleSelect";
import useRating from "../hooks/useRating";

function Rating({ defaultValue = "", onChange = () => {}, maxRating }) {
	const {
		value = "",
		handleChange = () => {},
		ratingOptions = [],
	} = useRating({
		defaultValue,
		onChange,
		maxRating,
	});

	return (
		<div className="w-full">
			<SingleSelect
				value={value}
				handleChange={handleChange}
				options={ratingOptions}
			/>
		</div>
	);
}

export default Rating;
