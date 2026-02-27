import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import { forwardRef } from "react";

import useChipWidths from "../hooks/useChipWidths";

import Chips from "./Chips";
import DropdownStaticOptionList from "./DropdownStaticOptionList";
import ExpandedView from "./ExpandedView";
import useDropDownStaticEditor from "./hooks/useDropDownStaticEditor";
import styles from "./styles.module.scss";

function DropDownStatic(
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
	} = useDropDownStaticEditor({
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
		selectionValues: currentOptions,
		availableWidth,
		availableHeight,
		isWrapped: wrapClass === "wrap",
	});

	return (
		<div
			className={styles.dropdown_static_container}
			ref={ref}
			style={{
				minWidth: width ? `${width - 4}px` : "136px", // 4px is the border width
			}}
		>
			<div
				className={styles.dropdown_static_input_container}
				data-testid="dropdown-static-editor"
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
					<DropdownStaticOptionList
						options={options}
						initialSelectedOptions={currentOptions}
						handleSelectOption={handleSelectOption}
					/>
				) : (
					<ExpandedView
						options={options}
						fieldName={fieldInfo?.name}
						currentOptions={currentOptions}
						handleSelectOption={handleSelectOption}
						onClose={() =>
							setPopper(() => ({
								expandedView: false,
								optionsList: true,
							}))
						}
					/>
				)}
			</ODSPopper>
		</div>
	);
}

export default forwardRef(DropDownStatic);
