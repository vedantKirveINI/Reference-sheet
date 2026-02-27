import isEmpty from "lodash/isEmpty";
import ODSButton from "oute-ds-button";
import ODSIcon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import { useCallback, useRef, useState } from "react";

import QUESTION_TYPE_ICON_MAPPING from "../../../../../../../../constants/questionTypeIconMapping";
import Chips from "../Chips";
import DropdownDynamicOptionList from "../DropdownDynamicOptionList";

import styles from "./styles.module.scss";

function DropdownDynamicExpandedView({
	options = [],
	handleSelectOption = () => {},
	currentOptions = [],
	onClose = () => {},
	fieldName = "",
}) {
	const [showOptionList, setShowOptionList] = useState(false);
	const selectOptionButtonRef = useRef(null);

	const closeOptionList = useCallback(() => {
		setShowOptionList(false);
	}, []);

	return (
		<div
			className={styles.expanded_view_container}
			onClick={closeOptionList}
		>
			<div className={styles.header}>
				<ODSIcon
					imageProps={{
						src: QUESTION_TYPE_ICON_MAPPING?.DROP_DOWN_STATIC,
						className: styles.dropdown_static_icon,
					}}
				/>

				<span className={styles.field_name}>{fieldName}</span>

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
				sx={{
					fontFamily: "Inter",
				}}
				ref={selectOptionButtonRef}
			>
				SELECT AN OPTION
			</ODSButton>

			<ODSPopper
				className={styles.popover_container}
				open={showOptionList}
				anchorEl={selectOptionButtonRef.current}
				placement="bottom-start"
				onClose={closeOptionList}
				style={{ zIndex: 9999999 }}
				disablePortal
			>
				<DropdownDynamicOptionList
					options={options}
					initialSelectedOptions={currentOptions}
					handleSelectOption={(selected) => {
						handleSelectOption(selected);
						setShowOptionList(false);
					}}
				/>
			</ODSPopper>
		</div>
	);
}

export default DropdownDynamicExpandedView;
