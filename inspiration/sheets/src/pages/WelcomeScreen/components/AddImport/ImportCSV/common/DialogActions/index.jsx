import ODSButton from "oute-ds-button";
import ODSLoadingButton from "oute-ds-loading-button";

import styles from "./styles.module.scss";

/**
 * DialogActions is a flexible footer component for dialog boxes that provides a consistent layout for action buttons.
 * It supports three types of actions:
 * 1. A back/previous action on the left
 * 2. A secondary action (like Cancel/Discard) in the middle
 * 3. A primary action (like Import/Proceed) on the right
 *
 * The component is highly customizable with different button labels, loading states, and button properties.
 *
 * @param {Object} props
 * @param {Function} [props.onPrevious] - Handler for the back/previous action
 * @param {Function} [props.primaryAction] - Handler for the primary action button
 * @param {Function} [props.secondaryAction] - Handler for the secondary action button
 * @param {string} [props.primaryLabel="IMPORT"] - Label for the primary action button
 * @param {string} [props.secondaryLabel="CANCEL"] - Label for the secondary action button
 * @param {string} [props.backLabel=""] - Label for the back/previous button
 * @param {boolean} [props.disableSubmit=false] - Whether to disable the primary action button
 * @param {boolean} [props.loading=false] - Whether to show loading state on buttons
 * @param {Object} [props.primaryButtonProps={}] - Additional props for the primary action button
 * @param {Object} [props.secondaryButtonProps={}] - Additional props for the secondary action button
 *
 * @example
 * <DialogActions
 *   onPrevious={handleBack}
 *   primaryAction={handleSubmit}
 *   secondaryAction={handleCancel}
 *   primaryLabel="PROCEED"
 *   secondaryLabel="CANCEL"
 *   backLabel="BACK"
 *   loading={isLoading}
 * />
 */

function DialogActions({
	onPrevious,
	primaryAction = () => {},
	secondaryAction = () => {},
	primaryLabel = "IMPORT",
	secondaryLabel = "CANCEL",
	backLabel = "",
	disableSubmit = false,
	loading = false,
	primaryButtonProps = {},
	secondaryButtonProps = {},
}) {
	return (
		<div className={styles.footer_container}>
			<div className={styles.left_action_footer}>
				{backLabel && onPrevious ? (
					<ODSButton
						variant="text-outlined"
						label={backLabel}
						disabled={loading}
						onClick={onPrevious}
					/>
				) : (
					<div />
				)}
			</div>

			<div className={styles.right_action_footer}>
				<ODSButton
					variant="black-outlined"
					label={secondaryLabel}
					onClick={secondaryAction}
					disabled={loading}
					{...secondaryButtonProps}
				/>
				<ODSLoadingButton
					variant="black"
					label={primaryLabel}
					loading={loading}
					disabled={disableSubmit}
					onClick={primaryAction}
					{...primaryButtonProps}
				/>
			</div>
		</div>
	);
}

export default DialogActions;
