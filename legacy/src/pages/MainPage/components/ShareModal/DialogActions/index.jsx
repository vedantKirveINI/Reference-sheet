import { Button } from "@/components/ui/button";
import { Check, Link } from "lucide-react";

import styles from "./styles.module.scss";

function DialogActions({
	handleSubmit = () => {},
	hasModifiedUsers = false,
	loading = false,
	handleCopyLink = () => {},
	isLinkCopied = false,
}) {
	return (
		<div className={styles.footer_container}>
			<div className={styles.left_action_footer}>
				{isLinkCopied ? (
					<div className={styles.copy_link_container}>
						<Check
							style={{
								color: "#29CC6A",
								width: "1.25rem",
								height: "1.25rem",
							}}
						/>
						<span style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "#212121" }}>
							Link copied to your clipboard
						</span>
					</div>
				) : (
					<Button
						variant="ghost"
						data-testid="copy-link-button"
						disabled={loading}
						onClick={handleCopyLink}
						style={{ color: "#212121" }}
					>
						<Link
							style={{
								color: "#212121",
								width: "1.25rem",
								height: "1.25rem",
								marginRight: "4px",
							}}
						/>
						COPY LINK
					</Button>
				)}
			</div>

			<div className={styles.right_action_footer}>
				{hasModifiedUsers && (
					<span style={{ fontSize: "0.875rem", color: "#607D8B" }}>
						Pending changes
					</span>
				)}

				<Button
					disabled={!hasModifiedUsers || loading}
					onClick={handleSubmit}
				>
					{loading ? "..." : "SAVE"}
				</Button>
			</div>
		</div>
	);
}

export default DialogActions;
