import ODSIcon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";

import SingleChoiceOptionList from "../../../QuestionType/Scq/ScqEditor/SingleChoiceOptionList";

import Chip from "./Chip";
import useScqFieldHandler from "./hooks/useScqFieldHandler";
import styles from "./styles.module.scss";

function ScqField({
	value = "",
	onChange = () => {},
	field = {},
	fieldIndex = 0,
}) {
	const {
		selectedOption,
		popperOpen,
		containerRef,
		popperContentRef,
		optionBackgroundColour,
		borderRadius,
		handlePopperContentClick,
		handleSelectOption,
		setPopperOpen,
		optionsList,
	} = useScqFieldHandler({ value, onChange, field, fieldIndex });

	return (
		<div
			className={styles.scq_field_container}
			ref={containerRef}
			onClick={() => setPopperOpen((prev) => !prev)}
			tabIndex={0}
			data-testid="scq-expanded-row"
		>
			<div className={styles.content_wrapper}>
				{selectedOption && (
					<Chip
						selectedOption={selectedOption}
						optionBackgroundColour={optionBackgroundColour}
						setPopperOpen={setPopperOpen}
						borderRadius={borderRadius}
					/>
				)}
			</div>

			<ODSIcon
				outeIconName={
					popperOpen ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon"
				}
			/>

			<ODSPopper
				className={styles.popover_container}
				open={popperOpen}
				anchorEl={containerRef.current}
				placement="bottom-start"
			>
				<div ref={popperContentRef} onClick={handlePopperContentClick}>
					<SingleChoiceOptionList
						options={optionsList}
						initialSelectedOption={selectedOption}
						handleSelectOption={(option) => {
							handleSelectOption(option);
							setPopperOpen(false);
						}}
					/>
				</div>
			</ODSPopper>
		</div>
	);
}

export default ScqField;
