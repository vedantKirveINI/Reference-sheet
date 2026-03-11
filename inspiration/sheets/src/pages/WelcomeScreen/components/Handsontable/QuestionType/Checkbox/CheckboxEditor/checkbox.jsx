import React, { useState } from "react";

import styles from "./styles.module.scss";

function Checkbox({
	initialValue = false,
	onChange = () => {},
	cellProperties,
}) {
	const [val, setVal] = useState(Boolean(initialValue));

	const { row } = cellProperties || {};
	const { hotTableRef } = cellProperties?.cellProperties || {};

	return (
		<div className={styles.container}>
			<input
				style={{ cursor: "pointer" }}
				type="checkbox"
				checked={val}
				onChange={(e) => {
					onChange(e.target.checked);
					setVal((p) => {
						if (!p) {
							hotTableRef?.current?.hotInstance.selectRows(row);
						}

						return !p;
					});
				}}
			/>
		</div>
	);
}

export default Checkbox;
