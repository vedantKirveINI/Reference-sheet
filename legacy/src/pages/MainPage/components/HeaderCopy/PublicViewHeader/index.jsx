import { Button } from "@/components/ui/button";
import { Info, HelpCircle, Table2 } from "lucide-react";

import styles from "./styles.module.scss";

function PublicViewHeader({
	name = "",
	onHelpClick = () => {},
	isMobile = false,
}) {
	return (
		<>
			<div className={styles.title}>
				<Table2
					style={{ width: "2.25rem", height: "2.25rem" }}
					aria-label="TINYTable Logo"
				/>

				<span
					style={{
						fontFamily: "Inter",
						fontWeight: "400",
						fontSize: "1.25rem",
						maxWidth: isMobile ? "20rem" : "44.875rem",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
						width: "100%",
					}}
				>
					{name}
				</span>
			</div>

			<nav className={styles.header_actions_container}>
				<ul className={styles.action_list}>
					<li>
						<Button
							variant="secondary"
							style={{
								backgroundColor: "#ECEFF1",
								color: "#212121",
								fontWeight: "400",
								fontFamily: "Inter",
								fontSize: "0.875rem",
								gap: "0.5rem",
							}}
						>
							<Info
								style={{
									color: "#212121",
									width: "1.5rem",
									height: "1.5rem",
								}}
							/>
							View only
						</Button>
					</li>
					<li>
						<Button
							variant="ghost"
							aria-label="Help"
							onClick={onHelpClick}
							style={{ gap: "0.75rem", fontSize: "0.875rem" }}
						>
							<HelpCircle
								style={{
									color: "#212121",
									width: "1.5rem",
									height: "1.5rem",
								}}
							/>
							HELP
						</Button>
					</li>
				</ul>
			</nav>
		</>
	);
}

export default PublicViewHeader;
