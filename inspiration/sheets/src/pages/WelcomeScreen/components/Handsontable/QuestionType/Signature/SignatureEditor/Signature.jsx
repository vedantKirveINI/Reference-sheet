import ODSDialog from "oute-ds-dialog";
import ODSIcon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import { useRef } from "react";

import ExpandedView from "../ExpandedView";

import Content from "./Content";
import Footer from "./Footer";
import Header from "./Header";
import useSignatureEditor from "./hooks/useSignatureEditor";
import styles from "./styles.module.scss";

function Signature(props) {
	const { initialValue = "", cellProperties = {} } = props;

	const { fieldInfo = {} } = cellProperties?.cellProperties || {};

	const { name: fieldName = "" } = fieldInfo || {};

	const {
		signatureImage = "",
		isExpanded = "",
		signatureRef,
		handleSignatureChange = () => {},
		setIsExpanded = () => {},
		onSave = () => {},
		loading = false,
		openDialog = () => {},
		closeDialog = () => {},
	} = useSignatureEditor(props);

	const popoverRef = useRef();

	return (
		<div
			className={styles.signature_container}
			data-testid="signature-editor"
		>
			<div
				className={styles.signature_input_container}
				style={{
					justifyContent: initialValue ? "space-between" : "flex-end",
				}}
			>
				{initialValue && (
					<ODSIcon
						imageProps={{
							src: initialValue,
							className: styles.signature_url_img,
						}}
					/>
				)}
				<div className={styles.action_container}>
					<div
						onClick={openDialog}
						data-testid="signature-edit-icon"
						className={styles.edit_action_icon}
					>
						<ODSIcon
							outeIconName="OUTEEditIcon"
							outeIconProps={{
								sx: {
									backgroundColor: "#21212133",
									color: "#212121",
									borderRadius: "0.125rem",
									width: "1.25rem",
									height: "1.25rem",
									"&:hover": {
										backgroundColor: "#212121",
										color: "#ffffff",
									},
								},
							}}
						/>
					</div>

					{initialValue && (
						<div
							ref={popoverRef}
							data-testid="signature-expand-icon"
							onClick={() => setIsExpanded(() => "expanded_view")}
							className={styles.expand_action_icon}
						>
							<ODSIcon
								outeIconName="OUTEOpenFullscreenIcon"
								outeIconProps={{
									sx: {
										color: "#fff",
										backgroundColor: "#212121",
										"&:hover": {
											backgroundColor: "#4d4d4d",
										},
										borderRadius: "0.125rem",
										width: "1.25rem",
										height: "1.25rem",
									},
								}}
							/>
						</div>
					)}
				</div>
			</div>

			<ODSPopper
				className={styles.signature_popper_container}
				open={isExpanded === "expanded_view"}
				placement="bottom-start"
				anchorEl={popoverRef.current}
				onClose={() => setIsExpanded(() => "")}
				disablePortal
			>
				<ExpandedView
					initialValue={initialValue}
					label="EDIT"
					setIsExpanded={setIsExpanded}
					openDialog={openDialog}
				/>
			</ODSPopper>

			<ODSDialog
				open={isExpanded === "open_dialog"}
				showFullscreenIcon={false}
				onClose={closeDialog}
				dialogWidth="33.625rem"
				dialogHeight="auto"
				draggable={false}
				hideBackdrop={false}
				removeContentPadding
				dialogTitle={<Header title={fieldName} />}
				dialogContent={
					<Content
						handleSignatureChange={handleSignatureChange}
						ref={signatureRef}
						signatureImage={signatureImage}
					/>
				}
				dialogActions={
					<Footer
						onClose={closeDialog}
						onSave={onSave}
						loading={loading}
					/>
				}
				onKeyDown={(e) => e.stopPropagation()}
			/>
		</div>
	);
}

export default Signature;
