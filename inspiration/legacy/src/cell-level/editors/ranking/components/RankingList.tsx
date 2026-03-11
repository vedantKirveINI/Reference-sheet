import React from "react";
import styles from "./RankingList.module.css";

interface RankingListProps {
	wrapClass?: string;
	visibleRankings: string[];
	limitValue: string;
}

export const RankingList: React.FC<RankingListProps> = ({
	wrapClass = "",
	visibleRankings = [],
	limitValue = "",
}) => {
	return (
		<>
			<div className={`${styles.tiles} ${wrapClass ? styles.wrap : ""}`}>
				{visibleRankings.map((item, index) => (
					<div
						key={`${item}-${index}`}
						className={styles.rank_item}
						title={item}
					>
						{item}
					</div>
				))}

				{limitValue && <div className={styles.ellipsis_chip}>...</div>}
			</div>

			{wrapClass !== "wrap" && <div className={styles.spacer} />}
		</>
	);
};
