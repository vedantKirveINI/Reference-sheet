import React from "react";
import getField from "@/common/forms/getField";
import ErrorLabel from "@/components/FieldModalOptions/common/ErrorLabel";
// import ODSIcon from "oute-ds-icon";
import styles from "./styles.module.scss";

function UpdateViewModalBody({
	controls = [],
	control,
	errors = {},
}) {
	return (
		<div className={styles.modal_form}>
			{controls.map((config) => {
				const { name, label, type, description, optionDetails } = config || {};
				
				// Modify config for radio type with optionDetails (stackingField)
				let updatedConfig = config;
				if (type === "radio" && optionDetails && name === "stackingField") {
					// Transform optionDetails to include custom labelText with icons
					const transformedOptionDetails = optionDetails.map((option) => {
						return {
							...option,
							labelText: (
								<div className={styles.radio_label}>
									{/* {option.icon && (
										<ODSIcon
											imageProps={{
												src: option.icon,
												className: styles.field_icon,
											}}
										/>
									)} */}
									<span>{option.label}</span>
								</div>
							),
						};
					});

					updatedConfig = {
						...config,
						optionDetails: transformedOptionDetails,
					};
				}

				// Get the field component based on type
				const Element = getField(type);
				if (!Element) return null;

				// Show message if no SCQ fields exist for stackingField
				if (
					type === "radio" &&
					name === "stackingField" &&
					(!optionDetails || optionDetails.length === 0)
				) {
					return (
						<div className={styles.field_container} key={name}>
							{label && <div className={styles.label}>{label}</div>}
							{description && (
								<div className={styles.description}>{description}</div>
							)}
							<div className={styles.no_scq_fields_message}>
								No SCQ fields available. You can add SCQ fields and configure
								stacking later.
							</div>
							<ErrorLabel errors={errors} name={name} />
						</div>
					);
				}

				return (
					<div className={styles.field_container} key={name}>
						{label && type !== 'switch' && <div className={styles.label}>{label}</div>}
						{description && (
							<div className={styles.description}>{description}</div>
						)}
						{type === "radio" && optionDetails ? (
							<div className={styles.radio_list_container}>
								<Element
									{...updatedConfig}
									control={control}
									errors={errors}
								/>
							</div>
						) : (
							<Element
								{...updatedConfig}
								control={control}
								errors={errors}
							/>
						)}
						<ErrorLabel errors={errors} name={name} />
					</div>
				);
			})}
		</div>
	);
}

export default UpdateViewModalBody;

