import ODSIcon from "oute-ds-icon";
import React, { useMemo } from "react";

import { getFileIcon } from "../../../../../../../components/FilePicker/utils/getFileIcon";
import { applyCustomClass } from "../../../utils/applyCustomClass";
import ErrorCellRenderer from "../../ErrorCell/ErrorCellRenderer";
import validateFileUpload from "../utils/validateFileUpload";

import styles from "./styles.module.scss";

const ICON_WIDTH = 24;
const CHIP_WIDTH = 36;
const ICON_HEIGHT = 24;

const SimpleChip = ({ label }) => <div className={styles.chip}>{label}</div>;

const FilePickerRenderer = (props) => {
	const {
		value = "",
		hotTableRef,
		row,
		cellProperties = {},
		TD,
		col,
		wrapValue = "",
	} = props;

	const cellWidth = TD.getBoundingClientRect().width;

	// Parse value safely

	const { isValid = false, newValue: validValue = [] } =
		validateFileUpload(value);

	const totalIcons = validValue?.length || 0;

	const { visibleIcons, hiddenIcons, hiddenCount } = useMemo(() => {
		let visibleCount = totalIcons;
		let hiddenCount = 0;

		if (wrapValue === "wrap") {
			return {
				visibleIcons: validValue || [],
				hiddenIcons: [],
				hiddenCount: 0,
			};
		}

		if (totalIcons * ICON_WIDTH > cellWidth) {
			const iconsFitWithChip = Math.floor(
				(cellWidth - CHIP_WIDTH) / ICON_WIDTH,
			);
			visibleCount = Math.max(0, iconsFitWithChip);
			hiddenCount = totalIcons - visibleCount;
		}

		return {
			visibleIcons: validValue?.slice(0, visibleCount) || [],
			hiddenIcons: validValue?.slice(visibleCount) || [],
			hiddenCount,
		};
	}, [totalIcons, wrapValue, cellWidth, validValue]);

	if (!isValid) return <ErrorCellRenderer {...props} />;

	const { totalRows = 0 } = cellProperties?.cellProperties;

	applyCustomClass({
		TD,
		col,
		row,
		totalRows,
		className: "col_border",
		hotTableRef,
	});

	const shouldShowChip = hiddenCount > 0 && wrapValue !== "wrap";

	return (
		<div className={styles.wrapper}>
			<div
				className={styles.visibleIcons}
				style={{ flexWrap: wrapValue !== "wrap" ? "nowrap" : "wrap" }}
			>
				{visibleIcons.map((file, index) => (
					<ODSIcon
						key={`visible-${index}`}
						outeIconName={getFileIcon(file?.mimeType)}
						outeIconProps={{
							sx: {
								width: `${ICON_WIDTH}px`,
								height: `${ICON_HEIGHT}px`,
								color: "#212121",
							},
						}}
					/>
				))}
			</div>

			{/* Chip */}
			{shouldShowChip && <SimpleChip label={`+ ${hiddenCount}`} />}

			{/* Hidden Icons */}
			<div className={styles.hiddenIcons}>
				{hiddenIcons.map((file, index) => (
					<ODSIcon
						key={`hidden-${index}`}
						outeIconName={getFileIcon(file?.mimeType)}
						outeIconProps={{
							sx: {
								width: `${ICON_WIDTH}px`,
								height: `${ICON_WIDTH}px`,
								color: "#212121",
							},
						}}
					/>
				))}
			</div>
		</div>
	);
};

export default FilePickerRenderer;
