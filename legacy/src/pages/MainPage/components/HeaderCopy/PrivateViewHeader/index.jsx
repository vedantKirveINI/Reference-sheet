import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Headset, HelpCircle, Table2 } from "lucide-react";

import styles from "./styles.module.scss";

function PrivateViewHeader({
	name = "",
	handleNameEdit = () => {},
	saveSheetName = () => {},
	textFieldRef = null,
	show = () => {},
	onHelpClick = () => {},
	onShareClick = () => {},
	isMobile = false,
}) {
	return (
		<>
			<div className={styles.title}>
				<Table2
					style={{ width: "2rem", height: "2rem" }}
					aria-label="TINYTable Logo"
				/>

				<Input
					data-testid="sheet-title-input"
					aria-label="Sheet Name"
					value={name}
					onChange={handleNameEdit}
					onBlur={() => {
						saveSheetName();
					}}
					ref={textFieldRef}
					style={{
						width: `${(name?.length || 0) + 1}ch`,
						minWidth: "16ch",
						maxWidth: isMobile ? "30rem" : "44.875rem",
						fontSize: "1.125rem",
						fontWeight: "600",
						overflow: "hidden",
						textOverflow: "ellipsis",
						color: "#212121",
						letterSpacing: "-0.01em",
						border: "none",
						padding: "0.5rem 0.75rem",
					}}
				/>
			</div>

			<nav className={styles.header_actions_container}>
				<ul className={styles.action_list}>
					{!isMobile && (
						<>
							<li>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => {
										show();
									}}
									style={{
										padding: "0.5rem",
										borderRadius: "8px",
									}}
								>
									<Headset
										style={{
											width: "1.5rem",
											height: "1.5rem",
											color: "#666666",
										}}
									/>
								</Button>
							</li>
							<li>
								<Button
									variant="ghost"
									aria-label="Help"
									onClick={onHelpClick}
									style={{
										gap: "0.5rem",
										fontSize: "0.875rem",
										fontWeight: "500",
										padding: "0.5rem 0.75rem",
										borderRadius: "8px",
										textTransform: "none",
									}}
								>
									<HelpCircle
										style={{
											color: "#666666",
											width: "1.25rem",
											height: "1.25rem",
										}}
									/>
									Help
								</Button>
							</li>
							<li>
								<Button
									aria-label="Share"
									data-testid="share-button"
									onClick={onShareClick}
									style={{
										fontSize: "0.875rem",
										fontWeight: "600",
										padding: "0.625rem 1.25rem",
										borderRadius: "0.375rem",
										textTransform: "none",
										background:
											"linear-gradient(90deg, #389b6a 3%)",
										color: "#ffffff",
										boxShadow:
											"0 2px 4px rgba(56, 155, 106, 0.3)",
									}}
								>
									SHARE
								</Button>
							</li>
						</>
					)}
				</ul>
			</nav>
		</>
	);
}

export default PrivateViewHeader;
