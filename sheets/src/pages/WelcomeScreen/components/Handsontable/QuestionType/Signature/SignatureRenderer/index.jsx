import ODSIcon from "oute-ds-icon";
import React from "react";

import { applyCustomClass } from "../../../utils/applyCustomClass";

import styles from "./styles.module.scss";

function SignatureRenderer(props) {
	const {
		value = "",
		hotTableRef,
		row,
		cellProperties = {},
		TD,
		col,
	} = props || {};

	const { totalRows = 0 } = cellProperties?.cellProperties;

	applyCustomClass({
		TD,
		col,
		row,
		totalRows: totalRows,
		className: "col_border",
		hotTableRef: hotTableRef,
	});

	if (row === hotTableRef.current?.hotInstance?.countRows() - 1) return;

	return (
		<div
			style={{
				maxWidth: "100%",
			}}
		>
			{value && (
				<ODSIcon
					imageProps={{
						src: value,
						className: styles.signature_icon,
					}}
				/>
			)}
		</div>
	);
}

export default SignatureRenderer;
