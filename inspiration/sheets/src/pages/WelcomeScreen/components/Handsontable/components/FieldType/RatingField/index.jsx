import Rating from "../../../QuestionType/Rating/RatingEditor/Rating";

import useRatingFieldHandler from "./hooks/useRatingFieldHandler";
import styles from "./styles.module.scss";

function RatingField({
	value = "",
	onChange = () => {},
	field = {},
	fieldIndex = 0,
}) {
	const { selectedOption, handleChange = () => {} } = useRatingFieldHandler({
		value,
		onChange,
		field,
	});

	return (
		<div
			className={styles.rating_field_container}
			data-testid="rating-expanded-row"
		>
			<Rating
				initialValue={selectedOption}
				onChange={handleChange}
				cellProperties={{
					cellProperties: {
						fieldInfo: field,
					},
				}}
				showEditorBorder={false}
				hidePopupIcon={false}
				autoOpen={false}
				autoFocus={fieldIndex === 0}
				disablePortal={false}
			/>
		</div>
	);
}

export default RatingField;
