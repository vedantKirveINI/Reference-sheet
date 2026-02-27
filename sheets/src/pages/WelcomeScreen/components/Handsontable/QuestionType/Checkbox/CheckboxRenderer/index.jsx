import expand_content from "../../../../../../../assets/common/expand_content.svg";
import styles from "./styles.module.scss";

const CheckboxRenderer = (prop) => {
	const { row, value = false, cellProperties } = prop || {};
	const { checkedRowsRef, hotTableRef } =
		cellProperties?.cellProperties || {};

	return (
		<div className={styles.container}>
			<div>
				<input
					checked={value}
					type="checkbox"
					onChange={(e) => {
						e.stopPropagation();
						let updatedArr = [];
						const updatedVal = e.target.checked;

						const prev =
							checkedRowsRef.current.rowSelectedArr || [];

						if (updatedVal) {
							updatedArr = [...prev, row];
							hotTableRef.current.hotInstance.selectRows(row);
						} else {
							updatedArr = prev.filter((idx) => idx !== row);
						}

						checkedRowsRef.current.rowSelectedArr = updatedArr;
					}}
				/>
			</div>

			<div
				onClick={() => {
					console.log("expand click");
				}}
			>
				<img src={expand_content} alt="" />
			</div>
		</div>
	);
};

export default CheckboxRenderer;
