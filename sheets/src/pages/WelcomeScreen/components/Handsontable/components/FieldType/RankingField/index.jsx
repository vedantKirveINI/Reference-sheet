import isEmpty from "lodash/isEmpty";
import Dialog from "oute-ds-dialog";

import Placeholder from "../../../../../../../components/Placeholder";
import RankingContent from "../../../QuestionType/Ranking/RankingEditor/Content";
import Footer from "../../../QuestionType/Ranking/RankingEditor/Footer";
import Header from "../../../QuestionType/Ranking/RankingEditor/Header";

import useRankingFieldHandler from "./hooks/useRankingFieldHandler";
import styles from "./styles.module.scss";

function RankingField({ value = "", onChange = () => {}, field = {} }) {
	const {
		ranking = [],
		isValid = false,
		showEditor = false,
		handleClick = () => {},
		closeDialog = () => {},
		handleChange = () => {},
		handleSave = () => {},
		fieldName = "",
		options = [],
		setRanking,
		initialValue = [],
	} = useRankingFieldHandler({ value, onChange, field });

	return (
		<>
			<div
				className={styles.ranking_container}
				onClick={handleClick}
				style={{
					padding: isEmpty(initialValue)
						? "0rem 0.625rem"
						: "0.625rem",
				}}
				data-testid="ranking-expanded-row"
			>
				{isEmpty(initialValue) || !isValid ? (
					<Placeholder value="Click to select a ranking" />
				) : (
					initialValue.map((item, index) => (
						<div
							key={`${item?.id}`}
							className={styles.rank_item}
							title={item?.label || item}
							data-testid={`ranking-expanded-row-item-${index}`}
						>
							{`${item?.rank}. ${item?.label}`}
						</div>
					))
				)}
			</div>

			{showEditor && (
				<Dialog
					open={showEditor}
					showFullscreenIcon={false}
					onClose={closeDialog}
					dialogWidth="33.625rem"
					dialogHeight="auto"
					draggable={false}
					hideBackdrop={false}
					removeContentPadding
					dialogTitle={<Header title={fieldName} />}
					dialogContent={
						<RankingContent
							ranking={ranking}
							setRanking={setRanking}
							handleChange={handleChange}
							options={options}
						/>
					}
					dialogActions={
						<Footer
							handleClose={closeDialog}
							handleSave={handleSave}
							disabled={isEmpty(ranking)}
						/>
					}
					onKeyDown={(e) => e.stopPropagation()}
				/>
			)}
		</>
	);
}

export default RankingField;
