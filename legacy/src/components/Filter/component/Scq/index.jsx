import SingleSelect from "../common/SingleSelect";
import useScqHandler from "../hooks/useScqHandler";

import styles from "./styles.module.scss";

function Scq({ defaultValue = "", onChange = () => {}, ...rest }) {
	const {
		value = "",
		handleChange = () => {},
		options = [],
		optionsWithColours = {},
	} = useScqHandler({
		defaultValue,
		onChange,
		rest,
	});

	return (
		<div className={styles.scq_container}>
			<SingleSelect
				value={value}
				handleChange={handleChange}
				options={options}
				optionBackgroundColor={optionsWithColours}
			/>
		</div>
	);
}

export default Scq;
