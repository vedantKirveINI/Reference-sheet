import SingleSelect from "../../../../../../../components/Filter/component/common/SingleSelect";
import YES_NO_OPTIONS from "../../../../../../../constants/yesNoOptions";
import { getYesNoColours } from "../../../../../../../utils/assignColours";

import useYesNoFieldHandler from "./hooks/useYesNoFieldHandler";
import styles from "./styles.module.scss";

const optionColourMapping = getYesNoColours();

function YesNoField({
	value = "",
	onChange = () => {},
	field = {},
	fieldIndex = 0,
}) {
	const { selectedOption, handleChange } = useYesNoFieldHandler({
		value,
		onChange,
		field,
	});

	return (
		<div
			className={styles.yes_no_field_container}
			data-testid="yes-no-expanded-row"
		>
			<SingleSelect
				value={selectedOption}
				handleChange={handleChange}
				options={YES_NO_OPTIONS}
				disablePortal={true}
				applyBorder={false}
				autoFocusSearch={true}
				optionBackgroundColor={optionColourMapping}
				chipFontSize="1rem"
				autoFocus={fieldIndex === 0}
			/>
		</div>
	);
}

export default YesNoField;
