import styles from "./styles.module.scss";

function RankingList({
	wrapClass = "",
	visibleRankings = [],
	limitValue = "",
}) {
	return (
		<>
			<div className={`${styles.tiles} ${styles[wrapClass]}`}>
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
}

export default RankingList;
