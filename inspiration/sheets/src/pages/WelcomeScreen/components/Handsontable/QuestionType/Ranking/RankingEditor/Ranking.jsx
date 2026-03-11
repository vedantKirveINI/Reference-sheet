import isEmpty from "lodash/isEmpty";
import Dialog from "oute-ds-dialog";
import ODSIcon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import { useCallback } from "react";

import ExpandedView from "../ExpandedView";
import useRankingEditor from "../hooks/useRankingEditor";
import useRankingTiles from "../hooks/useRankingTiles";
import RankingList from "../RankingList";

import RankingContent from "./Content";
import Footer from "./Footer";
import Header from "./Header";
import styles from "./styles.module.scss";

function Ranking(props) {
	const {
		isExpanded = "",
		setIsExpanded,
		openDialog = () => {},
		closeDialog = () => {},
		popoverRef,
		availableHeight = 0,
		availableWidth = 0,
		ranking = [],
		setRanking,
		handleChange = () => {},
		handleSave = () => {},
		options = [],
		wrapClass = "",
		rankingValues = [],
		isRankingValid = false,
		handlePopoverClose,
		handlePopoverOpen,
		fieldName = "",
	} = useRankingEditor(props);

	const { limitValue = 0, visibleRankings = [] } = useRankingTiles({
		rankingValues: rankingValues,
		availableWidth,
		availableHeight,
		isWrapped: wrapClass === "wrap",
	});

	const handleKeyDown = useCallback((e) => {
		e.stopPropagation();
	}, []);

	return (
		<div className={styles.rank_container}>
			{!isEmpty(ranking) && isRankingValid && (
				<div className={styles.rank_list} data-testid="ranking-editor">
					<RankingList
						wrapClass={wrapClass}
						visibleRankings={visibleRankings}
						limitValue={limitValue}
					/>

					<div
						className={styles.expand_icon}
						onClick={handlePopoverOpen}
						ref={popoverRef}
						data-testid="ranking-editor-expand-icon"
					>
						<ODSIcon
							outeIconName="OUTEOpenFullscreenIcon"
							outeIconProps={{
								sx: {
									width: "20px",
									height: "20px",
									backgroundColor: "#212121",
									color: "#fff",
									borderRadius: "2px",
								},
							}}
						/>
					</div>
				</div>
			)}

			<ODSPopper
				className={styles.ranking_popper_container}
				open={isExpanded === "expanded_view"}
				placement="bottom-start"
				anchorEl={popoverRef.current}
				onClose={handlePopoverClose}
				disablePortal
			>
				<ExpandedView
					ranking={ranking}
					label="EDIT"
					setIsExpanded={setIsExpanded}
					openDialog={openDialog}
					title={fieldName}
				/>
			</ODSPopper>

			<Dialog
				open={isExpanded === "open_dialog"}
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
				onKeyDown={handleKeyDown}
			/>
		</div>
	);
}

export default Ranking;
