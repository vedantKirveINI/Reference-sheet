import React, { useState } from "react";
import styles from "./styles.module.scss";

const StarRating = ({ rating, hotInstance, row, column }) => {
	const [filledStar, setFilledStar] = useState(rating);

	const handleClick = (star) => {
		setFilledStar(star);

		hotInstance.setDataAtCell(row, column, star, "updated_rating");
	};

	return (
		<div className={styles["star-rating-container"]}>
			{[...Array(5)].map((_, index) => {
				const starValue = index + 1;
				return (
					<span
						key={starValue}
						onClick={() => handleClick(starValue)}
						className={
							starValue <= rating
								? styles["star-filled"]
								: styles["star-empty"]
						}
					>
						{starValue <= filledStar ? "★" : "☆"}
					</span>
				);
			})}
		</div>
	);
};

export default StarRating;
