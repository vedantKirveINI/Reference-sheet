import { Signature } from "@oute/oute-ds.molecule.signature";
import Label from "oute-ds-label";
import React, { forwardRef } from "react";

import styles from "./styles.module.scss";

const Content = (
	{ handleSignatureChange = () => {}, signatureImage = "" },
	ref,
) => {
	return (
		<div className={styles.content_container}>
			<Label
				variant="subtitle1"
				color="#607D8B"
				sx={{ fontFamily: "Inter" }}
			>
				Please sign in the designated area below, ensuring your
				signature stays within the boundaries.
			</Label>
			<div className={styles.signature_canvas}>
				<Signature
					ref={ref}
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
	);
};

export default forwardRef(Content);
