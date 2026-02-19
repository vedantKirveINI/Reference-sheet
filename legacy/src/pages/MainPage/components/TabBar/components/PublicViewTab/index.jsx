import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
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
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className={styles.info_icon}>
											<Info
												style={{
													width: "1rem",
													height: "1rem",
												}}
											/>
										</div>
									</TooltipTrigger>
									<TooltipContent side="right">
										{table.description}
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
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
