import getField from "../../../../../../form/getField";
import ErrorLabel from "../../../FieldModalOptions/common/ErrorLabel";

import styles from "./styles.module.scss";

function DialogContent({ controls = [], control = {}, errors = {} }) {
	return (
		<div className={styles.content_container}>
			{(controls || []).map((config) => {
				const { name = "", type = "", label = "" } = config || {};
				const Element = getField(type);

				return (
					<div className={styles.text_container} key={name}>
						<div className={styles.label}>{label}</div>
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
