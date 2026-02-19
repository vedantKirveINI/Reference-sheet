import ODSIcon from "oute-ds-icon";
import ODSTooltip from "oute-ds-tooltip";
import { useEffect, forwardRef } from "react";

import styles from "./styles.module.scss";

const PublicViewTab = (
	{
		table = {},
		index,
		isActive = false,
		hideDivider = false,
		onClick = () => {},
	},
	ref,
) => {
	useEffect(() => {
		if (isActive) {
			ref.current?.scrollIntoView({
				behavior: "smooth",
				inline: "center",
			});
		}
	}, [isActive]);

	return (
		<div
			className={`${styles.tab_bar_container} ${isActive ? styles.active_tab_container : ""}`}
		>
			<div
				className={`${styles.tab_bar} ${isActive ? styles.active_tab : ""}`}
				data-testid={`table-name-container-${index}`}
			>
				{isActive ? (
					<div className={styles.table_name_editor_container}>
						<div
							className={styles.table_name_editor}
							style={{
								maxWidth: "85%",
							}}
							data-testid="table-name-editor"
							ref={ref}
						>
							{table?.name || "Untitled Table"}
						</div>
					</div>
				) : (
					<div
						className={styles.table_name_display}
						onClick={(e) => {
							e.stopPropagation();
							onClick();
						}}
					>
						{table?.name || "Untitled Table"}
					</div>
				)}

				{isActive ? (
					<div className={styles.info_container}>
						{table?.description ? (
							<ODSTooltip
								title={table.description}
								placement={"right-start"}
							>
								<div className={styles.info_icon}>
									<ODSIcon outeIconName="OUTEInfoIcon" />
								</div>
							</ODSTooltip>
						) : null}
					</div>
				) : null}
			</div>

			{!isActive && !hideDivider ? (
				<div className={styles.divider} />
			) : null}
		</div>
	);
};

export default forwardRef(PublicViewTab);
