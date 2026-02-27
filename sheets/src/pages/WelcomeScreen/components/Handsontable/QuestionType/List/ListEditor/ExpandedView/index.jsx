import isEmpty from "lodash/isEmpty";
import ODSButton from "oute-ds-button";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import ODSPopper from "oute-ds-popper";
import { useState, useRef } from "react";

import QUESTION_TYPE_ICON_MAPPING from "../../../../../../../../constants/questionTypeIconMapping";
import Chips from "../Chips";
import OptionList from "../OptionList";

import styles from "./styles.module.scss";

function ExpandedView({
	options = [],
	handleSelectOption = () => {},
	currentOptions = [],
	onClose = () => {},
	fieldName = "",
	handleAddNewOption = () => {},
}) {
	const [showOptionList, setShowOptionList] = useState(false);
	const selectOptionButtonRef = useRef(null);

	return (
		<div
			className={styles.expanded_view_container}
			onClick={() => setShowOptionList(false)}
		>
			<div className={styles.header_container}>
				<div className={styles.title}>
					<ODSIcon
						imageProps={{
							src: QUESTION_TYPE_ICON_MAPPING?.LIST,
							className: styles.list_icon,
						}}
					/>

					<ODSLabel
						variant="subtitle1"
						sx={{ fontFamily: "Inter", fontWeight: "400" }}
					>
						{fieldName}
					</ODSLabel>
				</div>

				<ODSIcon
					outeIconName="OUTECloseIcon"
					onClick={onClose}
					buttonProps={{
						sx: {
							padding: 0,
						},
					}}
					outeIconProps={{
						sx: {
							width: "1.25rem",
							height: "1.25rem",
							color: "#607D8B",
						},
					}}
				/>
			</div>

			<div className={styles.options_list}>
				{isEmpty(currentOptions) ? (
					<div className={styles.empty_option}>
						Please select an option
					</div>
				) : (
					<Chips
						options={currentOptions}
						src="expandedView"
						handleSelectOption={handleSelectOption}
					/>
				)}
			</div>

			<ODSButton
				variant="black-text"
				size="small"
				onClick={() => setShowOptionList((prev) => !prev)}
				sx={{ fontFamily: "Inter" }}
				ref={selectOptionButtonRef}
			>
				SELECT AN OPTION
			</ODSButton>

			<ODSPopper
				className={styles.popover_container}
				open={showOptionList}
				anchorEl={selectOptionButtonRef.current}
				placement="bottom-start"
				onClose={() => setShowOptionList(false)}
				style={{ zIndex: 9999999 }}
				disablePortal
			>
				<OptionList
					options={options}
					initialSelectedOptions={currentOptions}
					handleSelectOption={(selected) => {
						handleSelectOption(selected);
						setShowOptionList(false);
					}}
					handleAddNewOption={handleAddNewOption}
				/>
			</ODSPopper>
		</div>
	);
}

export default ExpandedView;
