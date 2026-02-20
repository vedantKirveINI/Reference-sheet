import kebabCase from "lodash/kebabCase";
import ODSTextField from "oute-ds-text-field";

import styles from "./styles.module.scss";

function AddressContent({ controls = [], register = () => {}, errors = {} }) {
	return (
		<div className={styles.form_container}>
			{controls.map((config) => {
				const { name, type, rules, label, ...rest } = config;

				return (
					<div key={name} className={styles.form_item}>
						<p className={styles.form_label}>{label}</p>
						<ODSTextField
							className="black"
							{...rest}
							type={type}
							{...register(name, rules)}
							inputProps={{
								style: { color: "#263238", fontSize: "1rem" },
							}}
							sx={{
								"& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
									{
										display: "none",
									},
							}}
							data-testid={`${kebabCase(name)}`}
						/>

						{errors?.[name] ? (
							<p className={styles.error}>
								{errors?.[name]?.message ||
									errors?.[name]?.type}
							</p>
						) : null}
					</div>
				);
			})}
		</div>
	);
}

export default AddressContent;
