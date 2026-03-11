import ODSIcon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";

import OptionList from "../../../QuestionType/List/ListEditor/OptionList";

import Chip from "./Chip";
import useListFieldHandler from "./hooks/useListFieldHandler";
import styles from "./styles.module.scss";

function ListField({ value = "", onChange }) {
	const {
		selectedOptions = [],
		isOpen = false,
		filteredOptions = [],
		containerRef,
		popperRef,
		handleSelectOption = () => {},
		handleAddNewOption = () => {},
		handleChipRemove = () => {},
		handlePopperContentClick = () => {},
	} = useListFieldHandler({ value, onChange });

	return (
		<div
			className={styles.list_field_container}
			ref={containerRef}
			tabIndex={0}
			onClick={handlePopperContentClick}
		>
			<div
				className={`${styles.list_field_input_container} ${isOpen ? styles.selected : ""}`}
				data-testid="list-expanded-row"
			>
				<div className={styles.chips_container}>
					{(selectedOptions || []).map((option, index) => (
						<Chip
							key={index}
							option={option}
							index={index}
							onRemove={handleChipRemove}
						/>
					))}
				</div>

				<div className={styles.toggle_icon}>
					<ODSIcon
						outeIconName={
							isOpen ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon"
						}
						outeIconProps={{
							sx: {
								width: "1.5rem",
								height: "1.5rem",
								cursor: "pointer",
							},
						}}
					/>
				</div>
			</div>

			<ODSPopper
				className={styles.popover_container}
				open={isOpen}
				anchorEl={containerRef.current}
				placement="bottom-start"
			>
				<div ref={popperRef}>
					<OptionList
						options={filteredOptions}
						initialSelectedOptions={selectedOptions}
						handleSelectOption={handleSelectOption}
						handleAddNewOption={handleAddNewOption}
					/>
				</div>
			</ODSPopper>
		</div>
	);
}

export default ListField;
