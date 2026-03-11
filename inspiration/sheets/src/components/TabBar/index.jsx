import ODSIcon from "oute-ds-icon";
import ODSTooltip from "oute-ds-tooltip";
import { useEffect, useState, forwardRef } from "react";

import useEditTableName from "../../pages/WelcomeScreen/hooks/useEditTableName";

import styles from "./styles.module.scss";

const TabBar = (
	{
		table = {},
		index,
		isActive = false,
		hideDivider = false,
		onClick = () => {},
		onTableSettingClick,
		setTableList = () => {},
	},
	ref,
) => {
	const [inputFocus, setInputFocus] = useState(false);

	const { saveTableName = () => {} } = useEditTableName({
		table,
		ref,
		setTableList,
	});

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
					<div
						className={`${styles.table_name_editor_container} 
                        ${inputFocus ? styles.focus_table_name_editor : ""}`}
					>
						<div
							contentEditable={true}
							className={styles.table_name_editor}
							style={{
								maxWidth: inputFocus ? "unset" : "85%",
							}}
							data-testid="table-name-editor"
							onBlur={(e) => {
								saveTableName(e.target.innerHTML);
								setInputFocus(false);
							}}
							onFocus={() => {
								setInputFocus(true);
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
								}
							}}
							ref={ref}
							dangerouslySetInnerHTML={{
								__html: table?.name,
							}}
						/>
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

						<span
							className={styles.expand_icon}
							onClick={onTableSettingClick}
						>
							<ODSIcon
								outeIconName="OUTEExpandMoreIcon"
								outeIconProps={{
									sx: {
										color: isActive ? "#99A6AF" : "#fff",
										width: "1.25rem",
										height: "1.25rem",
									},
								}}
							/>
						</span>
					</div>
				) : null}
			</div>

			{!isActive && !hideDivider ? (
				<div className={styles.divider} />
			) : null}
		</div>
	);
};

export default forwardRef(TabBar);
