import { forwardRef } from "react";

import SingleSelect from "../../../../../../../components/Filter/component/common/SingleSelect";
import YES_NO_OPTIONS from "../../../../../../../constants/yesNoOptions";

import useYesNoEditor from "./hooks/useYesNoEditor";
import styles from "./styles.module.scss";

function YesNo(props, ref) {
	const {
		selectedOption = "",
		optionColourMapping = {},
		handleKeyDown = () => {},
		handleChange = () => {},
	} = useYesNoEditor(props);

	return (
		<div
			className={styles.yes_no_container}
			onKeyDown={handleKeyDown}
			ref={ref}
			data-testid="yes-no-editor"
		>
			<SingleSelect
				value={selectedOption}
				handleChange={handleChange}
				options={YES_NO_OPTIONS}
				disablePortal={true}
				applyBorder={true}
				autoFocusSearch={true}
				optionBackgroundColor={optionColourMapping}
			/>
		</div>
	);
}

export default forwardRef(YesNo);
