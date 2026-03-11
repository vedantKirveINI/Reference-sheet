import Icon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import { forwardRef, useEffect } from "react";
import InputMask from "react-input-mask";

import { MERIDIEM_OPTIONS } from "../constants";
import useTimeEditor from "../hooks/useTimeEditor";

import styles from "./styles.module.scss";

function Time(
	{
		initialValue = "",
		onChange = () => {},
		cellProperties = {},
		superClose = () => {},
	},
	ref,
) {
	const {
		timeValue = {},
		setTimeValue,
		handleKeyDown = () => {},
		inputMaskRef,
		isTwentyFourHour = false,
		openDropdown = false,
		setOpenDropdown,
		triggerRef,
		iconName = "OUTEExpandMoreIcon",
		handleInputFocus = () => {},
	} = useTimeEditor({
		initialValue,
		onChange,
		cellProperties,
		superClose,
	});

	useEffect(() => {
		if (!openDropdown && inputMaskRef.current) {
			inputMaskRef.current.focus();
		}
	}, [inputMaskRef, openDropdown]);

	return (
		<div
			className={styles.time_container}
			ref={ref}
			tabIndex={0}
			onKeyDown={handleKeyDown}
			data-testid="time-editor"
		>
			<div className={styles.input_mask}>
				<InputMask
					autoFocus={!openDropdown}
					placeholder="HH:MM"
					mask="99:99"
					maskChar={null}
					value={timeValue?.time || ""}
					onChange={(e) => {
						setTimeValue((prev) => ({
							...prev,
							time: e.target.value,
						}));
					}}
					onFocus={handleInputFocus}
				>
					{() => {
						return (
							<input
								className={styles.custom_input}
								placeholder="HH:MM"
								ref={inputMaskRef}
								data-testid="editor-time-input"
							/>
						);
					}}
				</InputMask>

				{!isTwentyFourHour && (
					<div className={styles.meridiem_container}>
						<span className={styles.vertical_line} />

						<div
							className={styles.meridiem_content}
							data-testid="set-meridiem"
							ref={triggerRef}
							role="presentation"
							onClick={() => setOpenDropdown((prev) => !prev)}
						>
							<div className={styles.meridiem}>
								{timeValue?.meridiem}
							</div>
							<Icon
								outeIconName={iconName}
								outeIconProps={{
									sx: {
										width: "1rem",
										height: "1rem",
										color: "#000",
										marginLeft: "0.25rem",
									},
								}}
							/>
						</div>
					</div>
				)}
			</div>

			<ODSPopper
				className={styles.popover_container}
				open={openDropdown}
				anchorEl={triggerRef.current}
				placement="bottom-start"
				disablePortal
				onClose={() => setOpenDropdown(false)}
				sx={{
					padding: "0.5rem",
					borderRadius: "0.375rem",
					border: "0.75px solid #cfd8dc",
					background: "#fff",
					boxShadow: "0px 6px 12px 0px rgba(122, 124, 141, 0.2)",
				}}
			>
				{MERIDIEM_OPTIONS.map((option) => (
					<div
						className={styles.meridiem_option}
						key={option}
						onClick={() => {
							setTimeValue((prev) => ({
								...prev,
								meridiem: option,
							}));
							setOpenDropdown(false);
						}}
						role="presentation"
					>
						{option}
					</div>
				))}
			</ODSPopper>
		</div>
	);
}

export default forwardRef(Time);
