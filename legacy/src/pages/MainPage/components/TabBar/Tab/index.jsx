import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { Info, ChevronDown } from "lucide-react";
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
			ref.current.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "center",
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
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
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
							</TooltipTrigger>
							<TooltipContent side="bottom">
								{table?.name || "Untitled Table"}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				{isActive && (
					<div className={styles.info_container}>
						{table?.description ? (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className={styles.info_icon}>
											<Info
												style={{
													color: "#212121",
													width: "1.25rem",
													height: "1.25rem",
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

						<span
							className={styles.expand_icon}
							onClick={onTableSettingClick}
						>
							<ChevronDown
								style={{
									color: "#212121",
									width: "1.25rem",
									height: "1.25rem",
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
