import { Separator } from "@/components/ui/separator";

import ComingSoonTag from "../../../../../../components/common/ComingSoonTag";
import { importOptions } from "../../configuration/importOptions";

import styles from "./styles.module.scss";

function ImportSubmenu({
	open = false,
	anchorPosition = null,
	onClose = () => {},
	setImportSource = () => {},
	setImportModalOpen = () => {},
}) {
	if (!open || !anchorPosition) return null;

	return (
		<>
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					zIndex: 999,
				}}
				onClick={onClose}
			/>
			<div
				style={{
					position: "fixed",
					top: anchorPosition.top,
					left: anchorPosition.left,
					zIndex: 1000,
					minWidth: "200px",
					padding: "4px 0",
					boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
					border: "1px solid #e5e7eb",
					borderRadius: "8px",
					backgroundColor: "#fff",
				}}
			>
				{importOptions.map((option, index) => {
					const rightAdornments = [];
					if (option.hasTeamBadge) {
						rightAdornments.push(
							<div
								key="team-badge"
								className={styles.team_badge}
							>
								Team
							</div>,
						);
					}
					if (option.hasComingSoon) {
						rightAdornments.push(
							<ComingSoonTag
								key="coming-soon"
								text="Coming soon"
								variant="gray"
							/>,
						);
					}

					return (
						<div key={option.id}>
							<div
								onClick={() => {
									onClose();
									option.handler(setImportSource, setImportModalOpen);
								}}
								style={{
									padding: "8px 16px",
									minHeight: "36px",
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									cursor: "pointer",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = "#f5f5f5";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = "transparent";
								}}
							>
								<div style={{ display: "flex", alignItems: "center", flex: 1 }}>
									<span style={{ minWidth: "32px", display: "inline-flex", alignItems: "center" }}>
										<span
											style={{
												width: "1rem",
												height: "1rem",
												color: "#90A4AE",
											}}
										/>
									</span>
									<span
										style={{
											fontFamily: "Inter",
											fontWeight: "400",
											fontSize: "13px",
											color: "#212121",
										}}
									>
										{option.label}
									</span>
								</div>
								{rightAdornments.length > 0 && (
									<div
										style={{
											display: "flex",
											alignItems: "center",
											marginLeft: "8px",
											gap: "4px",
										}}
									>
										{rightAdornments}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</>
	);
}

export default ImportSubmenu;
