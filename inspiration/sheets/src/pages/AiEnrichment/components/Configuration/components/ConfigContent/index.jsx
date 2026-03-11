import ODSLabel from "oute-ds-label";
import { forwardRef, useImperativeHandle } from "react";

import getField from "../../../../../../form/getField";
import ErrorLabel from "../../../../../WelcomeScreen/components/FieldModalOptions/common/ErrorLabel";

import useContentHandler from "./hooks/useContentHandler";
import styles from "./styles.module.scss";

function ConfigContent({ value = {}, loading = false, onDomainChange }, ref) {
	const { controls, control, handleSubmit, errors } = useContentHandler({
		onDomainChange,
		value,
	});

	useImperativeHandle(ref, () => ({
		saveAiConfigurationData() {
			return new Promise((resolve, reject) => {
				handleSubmit(
					(data) => resolve(data),
					(error) => reject(error),
				)();
			});
		},
	}));

	return (
		<div>
			{controls.map((config) => {
				const { name, type, label } = config || {};
				config.disabled = loading;

				const Element = getField(type);
				return (
					<div key={name} className={styles.field_container}>
						<ODSLabel
							variant="body1"
							fontWeight="600"
							fontFamily="Inter"
							color="#263238"
							sx={{
								marginBottom: "0.5rem",
							}}
						>
							{label}
						</ODSLabel>
						{name === "url" && (
							<ODSLabel
								variant="body2"
								color="#607D8B"
								sx={{
									marginBottom: "0.75rem",
								}}
							>
								Enter a company URL and let AI generate a
								complete Ideal Customer Profile with
								firmographics, industry details, size, and other
								key insights.
							</ODSLabel>
						)}
						<Element {...config} control={control} />
						<ErrorLabel errors={errors} name={name} />
					</div>
				);
			})}
		</div>
	);
}

export default forwardRef(ConfigContent);
