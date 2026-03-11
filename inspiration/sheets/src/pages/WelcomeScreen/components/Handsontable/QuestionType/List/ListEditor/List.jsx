import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import { forwardRef } from "react";

import useChipWidths from "../hook/useChipWidths";

import Chips from "./Chips";
import ExpandedView from "./ExpandedView";
import useListEditor from "./hooks/useListEditor";
import OptionList from "./OptionList";
import styles from "./styles.module.scss";

function List(
	{
		initialValue = "[]",
		onChange = () => {},
		cellProperties = {},
		editorDimension = {},
	},
	ref,
) {
	const {
		currentOptions = [], // Master list of all options
		selectedOptions = [], // Currently selected options
		handleSelectOption = () => {},
		handleAddNewOption = () => {},
		expandedViewRef,
		availableWidth = "",
		availableHeight = "",
		popper = {},
		setPopper = {},
		wrapClass = "",
	} = useListEditor({
		initialValue,
		onChange,
		cellProperties,
		editorDimension,
		ref,
	});

	const { width = 0 } = editorDimension || {};

	const { visibleChips, limitValue, limitValueChipWidth } = useChipWidths({
		selectionValues: selectedOptions, // Use selectedOptions for chips
		availableWidth,
		availableHeight,
		withDeleteIcon: true,
		isWrapped: wrapClass === "wrap",
	});

	// Add new function to handle expanded view toggle
	const handleToggleExpandedView = () => {
		setPopper((prev) => ({
			...prev,
			optionsList: false,
			expandedView: !prev.expandedView,
		}));
	};

	// Add function to close expanded view
	const handleCloseExpandedView = () => {
		setPopper((prev) => ({
			...prev,
			expandedView: false,
		}));
	};

	return (
		<div
			className={styles.list_container}
			ref={ref}
			style={{
				minWidth: width ? `${width - 4}px` : "136px", // 4px is the border width
			}}
		>
			<div
				className={styles.list_input_container}
				data-testid="list-editor"
			>
				<Chips
					options={selectedOptions} // Show selected options as chips
					visibleChips={visibleChips}
					limitValue={limitValue}
					handleSelectOption={handleSelectOption}
					isWrapped={wrapClass === "wrap"}
					limitValueChipWidth={limitValueChipWidth}
				/>

				{(!isEmpty(selectedOptions) || popper?.expandedView) && (
					<div
						onClick={handleToggleExpandedView}
						ref={expandedViewRef}
					>
						<ODSIcon
							outeIconName="OUTEOpenFullscreenIcon"
							outeIconProps={{
								sx: {
									width: "20px",
									height: "20px",
									pointerEvents: "all !important",
									cursor: "pointer",
									backgroundColor: "#212121",
									color: "#fff",
									borderRadius: "0.125rem",
									"&:hover": {
										backgroundColor: "#4d4d4d",
									},
								},
							}}
						/>
					</div>
				)}
			</div>

			{/* Render ExpandedView when expandedView is true */}
			{popper.expandedView && (
				<ODSPopper
					className={styles.popover_container}
					open={popper.expandedView}
					anchorEl={expandedViewRef.current}
					placement="bottom-start"
					disablePortal
					style={{ zIndex: 9999999 }}
				>
					<ExpandedView
						options={currentOptions}
						handleSelectOption={handleSelectOption}
						handleAddNewOption={handleAddNewOption}
						currentOptions={selectedOptions}
						onClose={handleCloseExpandedView}
						fieldName={cellProperties?.name || "List Field"}
					/>
				</ODSPopper>
			)}

			{/* Render OptionList when optionsList is true */}
			<ODSPopper
				className={styles.popover_container}
				open={popper.optionsList && !popper.expandedView}
				anchorEl={popper.optionsList ? ref.current : expandedViewRef}
				placement="bottom-start"
				disablePortal
			>
				<OptionList
					options={currentOptions} // Pass all available options
					initialSelectedOptions={selectedOptions} // Pass currently selected options
					handleSelectOption={handleSelectOption}
					handleAddNewOption={handleAddNewOption} // Make sure this is passed
				/>
			</ODSPopper>
		</div>
	);
}

export default forwardRef(List);
