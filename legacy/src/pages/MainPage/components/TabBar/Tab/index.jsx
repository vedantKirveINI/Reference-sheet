import ODSIcon from "oute-ds-icon";
import ODSTooltip from "oute-ds-tooltip";
import { useEffect, forwardRef } from "react";

import styles from "./styles.module.scss";

const TabBar = (
	{
		table = {},
		index,
		isActive = false,
		hideDivider = false,
		onClick = () => {},
		onTableSettingClick,
	},
	ref,
) => {
	useEffect(() => {
		if (isActive && ref && ref.current) {
			// Scroll the active tab into view smoothly
			ref.current.scrollIntoView({
				behavior: "smooth",
				block: "nearest", // ignore vertical
				inline: "center", // center the tab in view
			});
		}
	}, [isActive, ref]);

	return (
		<div
			className={`${styles.tab_bar_container} ${isActive ? styles.active_tab_container : ""}`}
			ref={isActive && ref ? ref : null}
		>
			<div
				className={`${styles.tab_bar} ${isActive ? styles.active_tab : ""}`}
				data-testid={`table-name-container-${index}`}
			>
				<div className={styles.table_name_wrapper}>
					<ODSTooltip
						title={table?.name || "Untitled Table"}
						placement="bottom"
					>
						<div
							className={styles.table_name_display}
							role="button"
							tabIndex={0}
							onClick={(e) => {
								e.stopPropagation();
								onClick();
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onClick();
								}
							}}
						>
							{table?.name || "Untitled Table"}
						</div>
					</ODSTooltip>
				</div>

				{isActive && (
					<div className={styles.info_container}>
						{table?.description ? (
							<ODSTooltip
								title={table.description}
								placement={"right-start"}
							>
								<div className={styles.info_icon}>
									<ODSIcon
										outeIconName="OUTEInfoIcon"
										outeIconProps={{
											sx: {
												color: "#212121",
												width: "1.25rem",
												height: "1.25rem",
											},
										}}
									/>
								</div>
							</ODSTooltip>
						) : null}

						<span
							className={styles.expand_icon}
							onClick={onTableSettingClick}
						>
							<ODSIcon
								outeIconName="OUTEExpandMoreIcon"
								outeIconProps={{
									sx: {
										color: "#212121",
										width: "1.25rem",
										height: "1.25rem",
									},
								}}
							/>
						</span>
					</div>
				)}
			</div>

			{!isActive && !hideDivider ? (
				<div className={styles.divider} />
			) : null}
		</div>
	);
};

export default forwardRef(TabBar);
