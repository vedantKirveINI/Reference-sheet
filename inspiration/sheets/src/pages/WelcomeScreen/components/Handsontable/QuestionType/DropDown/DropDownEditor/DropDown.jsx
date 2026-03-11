import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import { forwardRef } from "react";

import useChipWidths from "../../DropDownStatic/hooks/useChipWidths";
import { getOptionLabel } from "../utils/getOptionLabel";

import Chips from "./Chips";
import DropdownDynamicOptionList from "./DropdownDynamicOptionList";
import DropdownDynamicExpandedView from "./ExpandedView";
import useDropDownEditor from "./hooks/useDropDownEditor";
import styles from "./styles.module.scss";

function DropDown(
	{
		initialValue = "",
		onChange = () => {},
		cellProperties = {},
		superClose = () => {},
		editorDimension = {},
	},
	ref,
) {
	const {
		currentOptions = [],
		options = [],
		handleSelectOption = () => {},
		handleKeyDown = () => {},
		expandedViewRef,
		availableWidth = "",
		availableHeight = "",
		popper = true,
		setPopper = () => {},
		wrapClass = "",
		fieldInfo = {},
	} = useDropDownEditor({
		initialValue,
		onChange,
		superClose,
		cellProperties,
		editorDimension,
		ref,
	});

	const { width = 0 } = editorDimension || {};

	const {
		visibleChips = [],
		limitValue = "",
		limitValueChipWidth = 0,
	} = useChipWidths({
		selectionValues: getOptionLabel({ optionsList: currentOptions }),
		availableWidth,
		availableHeight,
		isWrapped: wrapClass === "wrap",
	});

	return (
		<div
			className={styles.dropdown_dynamic_container}
			ref={ref}
			style={{
				minWidth: width ? `${width - 4}px` : "136px", // 4px is the border width
			}}
			data-testid="dropdown-editor"
		>
			<div
				className={styles.dropdown_dynamic_input_container}
				onKeyDown={handleKeyDown}
			>
				<Chips
					options={currentOptions}
					visibleChips={visibleChips}
					limitValue={limitValue}
					handleSelectOption={handleSelectOption}
					isWrapped={wrapClass === "wrap"}
					limitValueChipWidth={limitValueChipWidth}
				/>

				{(!isEmpty(currentOptions) || popper?.expandedView) && (
					<div
						onClick={() => {
							setPopper((prev) => ({
								...prev,
								expandedView: !prev.expandedView,
								optionsList: !prev.optionsList,
							}));
						}}
						ref={expandedViewRef}
					>
						<ODSIcon
							outeIconName="OUTEOpenFullscreenIcon"
							outeIconProps={{
								sx: {
									width: "20px",
									height: "20px",
									pointerEvents: "all !important", // pointer events is 'none' in ODS svgs
									cursor: "pointer",
									backgroundColor: "#212121",
									color: "#fff",
									borderRadius: "2px",
									"&:hover": {
										backgroundColor: "#4d4d4d",
									},
								},
							}}
						/>
					</div>
				)}
			</div>

			<ODSPopper
				className={styles.popover_container}
				open={popper.optionsList || popper.expandedView}
				anchorEl={
					popper.optionsList ? ref.current : expandedViewRef.current
				}
				placement="bottom-start"
				disablePortal
			>
				{popper?.optionsList ? (
					<DropdownDynamicOptionList
						options={options}
						initialSelectedOptions={currentOptions}
						handleSelectOption={handleSelectOption}
					/>
				) : (
					<DropdownDynamicExpandedView
						options={options}
						fieldName={fieldInfo?.name}
						currentOptions={currentOptions}
						handleSelectOption={handleSelectOption}
						onClose={() =>
							setPopper({
								expandedView: false,
								optionsList: true,
							})
						}
					/>
				)}
			</ODSPopper>
		</div>
	);
}

export default forwardRef(DropDown);
