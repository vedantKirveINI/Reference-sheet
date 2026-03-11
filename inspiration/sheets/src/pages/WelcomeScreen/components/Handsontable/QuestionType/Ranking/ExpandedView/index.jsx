import ODSButton from "oute-ds-button";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";

import { RANKING_ICON } from "../../../../../../../constants/Icons/questionTypeIcons";

import styles from "./styles.module.scss";

const ExpandedView = ({
	ranking = [],
	variant = "black",
	label = "EDIT",
	setIsExpanded,
	openDialog = () => {},
	title = "",
}) => {
	return (
		<div className={styles.expanded_view}>
			<div className={styles.title_container}>
				<div
					className={styles.title}
					data-testid="popover-ranking-header"
				>
					<ODSIcon
						imageProps={{
							src: RANKING_ICON,
							className: styles.ranking_icon,
						}}
					/>
					<ODSLabel variant="subtitle1" sx={{ fontFamily: "Inter" }}>
						{title}
					</ODSLabel>
				</div>

				<ODSIcon
					outeIconName="OUTECloseIcon"
					onClick={() => setIsExpanded(() => "")}
					outeIconProps={{
						sx: {
							cursor: "pointer",
						},
					}}
					buttonProps={{
						sx: {
							padding: 0,
						},
					}}
				/>
			</div>

			<div className={styles.rank_list} data-testid="ranking-list">
				{ranking.map((element) => {
					return (
						<div
							key={element.id}
							className={styles.rank_item}
							data-testid={`ranking-item-${element.rank}`}
						>
							<ODSLabel
								variant="subtitle1"
								sx={{
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>{`${element.rank}. ${element.label}`}</ODSLabel>
						</div>
					);
				})}
			</div>

			<ODSButton
				variant={variant}
				label={label}
				onClick={openDialog}
				startIcon={
					<ODSIcon
						outeIconName="OUTEEditIcon"
						outeIconProps={{
							sx: {
								color: "#ffffff",
							},
						}}
					/>
				}
			/>
		</div>
	);
};

export default ExpandedView;
