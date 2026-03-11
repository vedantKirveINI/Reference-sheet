import React, { useMemo } from "react";
import type { ICell, IColumn } from "@/types";
import type { IOpinionScaleCell } from "@/types";
import { validateOpinionScale } from "@/cell-level/renderers/opinion-scale/utils/validateOpinionScale";
import styles from "./OpinionScaleRenderer.module.scss";

interface OpinionScaleRendererProps {
	cell: ICell;
	column: IColumn;
}

export const OpinionScaleRenderer: React.FC<OpinionScaleRendererProps> = ({
	cell,
	column,
}) => {
	const opinionScaleCell = cell as IOpinionScaleCell | undefined;

	// Get options with defaults
	const fieldOptions = column.options as { maxValue?: number } | undefined;
	const maxValue =
		fieldOptions?.maxValue ?? opinionScaleCell?.options?.maxValue ?? 10;

	// Parse and validate current value
	const { processedValue } = useMemo(() => {
		return validateOpinionScale({
			value: (cell.data ?? opinionScaleCell?.data) as
				| number
				| string
				| null
				| undefined,
			maxValue,
		});
	}, [cell.data, opinionScaleCell?.data, maxValue]);

	// Don't render if value is null or invalid
	if (processedValue == null) {
		return null;
	}

	// Format display text (e.g., "4/10")
	const displayText = `${processedValue}/${maxValue}`;

	return (
		<div className={styles.opinionScaleContainer}>
			<span className={styles.opinionScaleValue}>{displayText}</span>
		</div>
	);
};
