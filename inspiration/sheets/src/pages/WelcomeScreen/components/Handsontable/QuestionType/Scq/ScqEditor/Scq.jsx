import ODSPopper from "oute-ds-popper";
import React, { forwardRef } from "react";

import useChipWidths from "../hooks/useChipWidths";

import Chip from "./Chip";
import useScqEditor from "./hooks/useScqEditor";
import SingleChoiceOptionList from "./SingleChoiceOptionList";
import styles from "./styles.module.scss";

function Scq(props, ref) {
	const { cellProperties = {} } = props || {};
	const { wrapClass = "" } = cellProperties?.cellProperties || {};

	const {
		selectedOption = "",
		handleKeyDown = () => {},
		handleSelectOption,
		options = [],
		optionBackgroundColour = {},
		popperOpen = false,
		setPopperOpen,
		availableWidth = 0,
	} = useScqEditor(props, ref);

	const { borderRadius } = useChipWidths({
		selectionValue: selectedOption,
		availableWidth,
		wrapValue: wrapClass,
	});

	return (
		<div
			className={styles.scq_container}
			ref={ref}
			data-testid="scq-editor"
			onKeyDown={handleKeyDown}
		>
			{selectedOption && (
				<Chip
					selectedOption={selectedOption}
					optionBackgroundColour={optionBackgroundColour}
					setPopperOpen={setPopperOpen}
					wrapClass={wrapClass}
					borderRadius={borderRadius}
				/>
			)}

			<ODSPopper
				className={styles.popover_container}
				open={popperOpen}
				anchorEl={ref.current}
				placement="bottom-start"
				disablePortal
			>
				<SingleChoiceOptionList
					options={options}
					initialSelectedOption={selectedOption}
					handleSelectOption={(option) => {
						handleSelectOption(option);
						setPopperOpen(false);
					}}
				/>
			</ODSPopper>
		</div>
	);
}

export default forwardRef(Scq);
