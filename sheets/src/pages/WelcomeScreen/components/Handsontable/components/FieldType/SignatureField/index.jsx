import { Signature } from "@oute/oute-ds.molecule.signature";
import ODSButton from "oute-ds-button";
import ODSDialog from "oute-ds-dialog";
import ODSLabel from "oute-ds-label";
import ODSLoadingButton from "oute-ds-loading-button";

import Header from "./Header";
import useSignatureFieldHandler from "./hooks/useSignatureFieldHandler";
import styles from "./styles.module.scss";

function SignatureField({ value = "", onChange = () => {}, field = {} }) {
	const { name: fieldName = "" } = field || {};

	const {
		open,
		signatureImage,
		loading,
		signatureRef,
		handleClick,
		handleClose,
		handleSignatureChange,
		handleSave,
	} = useSignatureFieldHandler({ value, onChange });

	return (
		<div
			className={styles.signature_field_container}
			data-testid="signature-expanded-row"
		>
			{value ? (
				<div className={styles.signature_preview_area}>
					<img
						src={value}
						alt="Signature"
						className={styles.signature_img}
					/>
					<ODSButton
						variant="text-outlined"
						className={styles.edit_signature_btn}
						onClick={handleClick}
					>
						EDIT SIGNATURE
					</ODSButton>
				</div>
			) : (
				<ODSButton
					variant="black-outlined"
					onClick={handleClick}
					label="ADD SIGNATURE"
				/>
			)}

			<ODSDialog
				open={open}
				showFullscreenIcon={false}
				onClose={handleClose}
				dialogWidth="35rem"
				dialogHeight="auto"
				draggable={false}
				hideBackdrop={false}
				removeContentPadding
				dialogTitle={<Header title={fieldName} />}
				dialogContent={
					<div className={styles.content_container}>
						<ODSLabel
							variant="subtitle1"
							color="#607D8B"
							sx={{ fontFamily: "Inter" }}
						>
							Please sign in the designated area below, ensuring
							your signature stays within the boundaries.
						</ODSLabel>
						<div className={styles.signature_canvas}>
							<Signature
								ref={signatureRef}
								value={signatureImage}
								onChange={handleSignatureChange}
								canvasProps={{
									style: {
										width: "30.625rem",
										height: "15rem",
										border: "0.047rem solid rgba(0, 0, 0, 0.20)",
										borderRadius: "0.75rem",
									},
									"data-testid": "signature-canvas",
								}}
							/>
						</div>
					</div>
				}
				dialogActions={
					<div className={styles.footer_container}>
						<ODSButton
							variant="black-outlined"
							label="DISCARD"
							onClick={handleClose}
							disabled={loading}
						/>
						<ODSLoadingButton
							variant="black"
							label="SAVE"
							onClick={handleSave}
							loading={loading}
						/>
					</div>
				}
				onKeyDown={(e) => e.stopPropagation()}
			/>
		</div>
	);
}

export default SignatureField;
