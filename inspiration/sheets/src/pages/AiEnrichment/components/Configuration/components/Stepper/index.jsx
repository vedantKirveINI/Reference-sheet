import { Stepper, Step, StepLabel, StepContent } from "@mui/material";
import ODSButton from "oute-ds-button";
import ODSLabel from "oute-ds-label";

import styles from "./styles.module.scss";

function ConfigurationStepper({
	activeStep = 0,
	steps = [],
	stepContent = [],
	stepActions = [],
}) {
	const handleAction = (action) => {
		if (action && action.onClick) {
			action.onClick();
		}
	};

	// Get actions for current step
	const getCurrentStepActions = (stepIndex) => {
		if (stepActions && stepActions[stepIndex]) {
			return stepActions[stepIndex];
		}
		return [];
	};

	return (
		<div className={styles.stepper_container}>
			<Stepper activeStep={activeStep} orientation="vertical">
				{steps.map((step, index) => {
					const currentActions = getCurrentStepActions(index);

					return (
						<Step key={step.label}>
							<StepLabel
								sx={{
									"& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium.MuiStepIcon-root.Mui-active":
										{
											color: "#389b6a",
										},
									"& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium.MuiStepIcon-root":
										{
											color: "#389b6a",
										},
								}}
							>
								{step.label}
							</StepLabel>
							<StepContent>
								<ODSLabel variant="body2" color="#607D8B">
									{step.description}
								</ODSLabel>

								{/* Render the step content here */}
								{stepContent[index] && (
									<div className={styles.step_content}>
										{stepContent[index]}
									</div>
								)}

								<div className={styles.step_actions}>
									{currentActions.map(
										(action, actionIndex) => {
											return (
												<ODSButton
													key={`${index}-${actionIndex}`}
													variant={
														action.variant ||
														"black"
													}
													onClick={() =>
														handleAction(action)
													}
													loading={
														action.loading || false
													}
													disabled={
														action.disabled || false
													}
												>
													{action.label}
												</ODSButton>
											);
										},
									)}
								</div>
							</StepContent>
						</Step>
					);
				})}
			</Stepper>
		</div>
	);
}

export default ConfigurationStepper;
