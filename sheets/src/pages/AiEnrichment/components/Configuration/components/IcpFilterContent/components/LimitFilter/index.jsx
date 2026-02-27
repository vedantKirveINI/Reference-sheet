import ODSIcon from "oute-ds-icon";
import ODSTextField from "oute-ds-text-field";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

import styles from "./styles.module.scss";

function LimitFilter({ sectionId, onFilterCountChange }, ref) {
	const [limitValue, setLimitValue] = useState("");

	const handleLimitChange = (event) => {
		const value = event.target.value;
		const numValue = parseInt(value, 10);

		// Allow empty string for clearing the field
		if (value === "") {
			setLimitValue("");
			return;
		}

		// Check if it's a valid number
		if (isNaN(numValue)) {
			return; // Don't update if it's not a valid number
		}

		// Ensure the number is between 1 and 100
		if (numValue >= 1 && numValue <= 100) {
			setLimitValue(value);
		} else if (numValue > 100) {
			setLimitValue("100");
		} else if (numValue < 1) {
			setLimitValue("1");
		}
	};

	// Calculate and report filter count whenever limitValue changes
	useEffect(() => {
		if (onFilterCountChange && sectionId) {
			const hasFilter = limitValue && limitValue.trim() !== "";
			onFilterCountChange(sectionId, hasFilter ? 1 : 0);
		}
	}, [limitValue, onFilterCountChange, sectionId]);

	useImperativeHandle(
		ref,
		() => ({
			getLimitData() {
				return new Promise((resolve, _reject) => {
					resolve(limitValue);
				});
			},
		}),
		[limitValue],
	);

	return (
		<div className={styles.limit_filter_container}>
			<div className={styles.limit_content}>
				<div className={styles.limit_header}>
					<div className={styles.limit_title_section}>
						<ODSIcon
							outeIconName="OUTESpeedIcon"
							outeIconProps={{
								sx: {
									width: "16px",
									height: "16px",
									color: "#6b7280",
									marginRight: "0.5rem",
								},
							}}
						/>
						<h3 className={styles.limit_title}>Limit</h3>
					</div>
				</div>

				<div className={styles.limit_description}>
					<p className={styles.limit_text}>
						100 record max per search. To import more than 100
						records, contact your workspace admin to upgrade your
						plan.
					</p>
				</div>

				<div className={styles.limit_input_container}>
					<ODSTextField
						className="black"
						fullWidth
						placeholder="e.g. 10"
						value={limitValue}
						onChange={handleLimitChange}
						type="number"
						inputProps={{
							min: 1,
							max: 100,
							step: 1,
						}}
					/>
				</div>
			</div>
		</div>
	);
}

export default forwardRef(LimitFilter);
