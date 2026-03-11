import getField from "@/common/forms/getField";
import ErrorLabel from "@/components/FieldModalOptions/common/ErrorLabel";

import styles from "./styles.module.scss";

function RenameTableModalBody({
	controls = [],
	control,
	errors = {},
	controlRef = null,
}) {
	return (
		<div className={styles.modal_form}>
			{controls.map((config) => {
				const { name, label, type } = config || {};
				const Element = getField(type);

				return (
					<div className={styles.field_container} key={name}>
						<div className={styles.label}>{label}</div>
						<Element
							{...config}
							control={control}
							errors={errors}
							ref={(ele) => {
								if (ele && controlRef?.current) {
									controlRef.current[name] = ele;
								}
							}}
						/>
						<ErrorLabel errors={errors} name={name} />
					</div>
				);
			})}
		</div>
	);
}

export default RenameTableModalBody;
