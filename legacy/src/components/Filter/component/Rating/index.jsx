import SingleSelect from "../common/SingleSelect";
import useRating from "../hooks/useRating";

import styles from "./styles.module.scss";

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
		<div className={styles.rating_container}>
			<SingleSelect
				value={value}
				handleChange={handleChange}
				options={ratingOptions}
			/>
		</div>
	);
}

export default Rating;
