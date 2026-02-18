import SingleSelect from "../common/SingleSelect";
import useScqHandler from "../hooks/useScqHandler";

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
		<div className="w-full">
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
