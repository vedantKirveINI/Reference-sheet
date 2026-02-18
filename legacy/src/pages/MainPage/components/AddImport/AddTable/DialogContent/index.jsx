import getField from "../../../../../../common/forms/getField";
import ErrorLabel from "../../../../../../common/forms/ErrorLabel";

function DialogContent({ controls = [], control = {}, errors = {} }) {
	return (
		<div>
			{(controls || []).map((config) => {
				const { name = "", type = "", label = "" } = config || {};
				const Element = getField(type);

				return (
					<div className="p-6" key={name}>
						<div className="mb-2 ml-3">{label}</div>
						<Element
							{...config}
							control={control}
							errors={errors}
						/>
						<ErrorLabel errors={errors} name={name} label={label} />
					</div>
				);
			})}
		</div>
	);
}

export default DialogContent;
