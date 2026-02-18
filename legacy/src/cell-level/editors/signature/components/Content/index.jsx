import { Signature } from "@oute/oute-ds.molecule.signature";
import React, { forwardRef } from "react";

const Content = (
	{ handleSignatureChange = () => {}, signatureImage = "" },
	ref,
) => {
	return (
		<div className="px-6 py-8">
			<span className="text-sm font-normal font-sans text-[#607D8B]">
				Please sign in the designated area below, ensuring your
				signature stays within the boundaries.
			</span>
			<div className="mt-5">
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
