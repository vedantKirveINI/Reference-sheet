import { Button } from "@/components/ui/button";

import styles from "./styles.module.scss";

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
	const { startIcon, ...restSecondaryProps } = secondaryButtonProps || {};
	const { ...restPrimaryProps } = primaryButtonProps || {};

	return (
		<div className={styles.footer_container}>
			<div className={styles.left_action_footer}>
				{backLabel && onPrevious ? (
					<Button
						variant="ghost"
						onClick={onPrevious}
						disabled={loading}
						style={{
							fontSize: "0.875rem",
							fontWeight: "500",
							textTransform: "none",
						}}
					>
						{backLabel}
					</Button>
				) : (
					<div />
				)}
			</div>

			<div className={styles.right_action_footer}>
				<Button
					variant="outline"
					onClick={secondaryAction}
					disabled={loading}
					style={{
						fontSize: "0.875rem",
						fontWeight: "500",
						textTransform: "none",
					}}
					{...restSecondaryProps}
				>
					{startIcon && <span style={{ marginRight: "4px", display: "inline-flex" }}>{startIcon}</span>}
					{secondaryLabel}
				</Button>
				<Button
					onClick={primaryAction}
					disabled={loading || disableSubmit}
					style={{
						fontSize: "0.875rem",
						fontWeight: "500",
						textTransform: "none",
					}}
					{...restPrimaryProps}
				>
					{loading ? "..." : primaryLabel}
				</Button>
			</div>
		</div>
	);
}

export default DialogActions;
