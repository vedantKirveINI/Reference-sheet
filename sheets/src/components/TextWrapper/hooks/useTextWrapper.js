import isEmpty from "lodash/isEmpty";
import { useState, useEffect } from "react";

import useDecodedUrlParams from "../../../hooks/useDecodedUrlParams";
import {
	createRange,
	parseColumnMeta,
} from "../../../pages/WelcomeScreen/components/Handsontable/utils/helper";
import { TEXT_WRAP_OPTIONS } from "../constants";

const handleSelection = ({
	hotInstance = {},
	fields = [],
	textWrapped = {},
	setWrapValue = () => {},
	setIsCellSelected = () => {},
}) => {
	const selected = hotInstance?.getSelected(); // returns [[row, col, endRow, endCol]]
	setIsCellSelected(!!selected);

	if (selected) {
		const selectionArrray = selected[0];
		let startCol = selectionArrray[1];

		if (startCol < 0) {
			startCol = 0;
		}

		const dbFieldName = hotInstance?.colToProp(startCol);

		const currentFieldId = fields?.find(
			(field) => field?.dbFieldName === dbFieldName,
		)?.id;

		const appliedWrap =
			textWrapped?.[currentFieldId]?.text_wrap || "ellipses";

		const wrapValue = TEXT_WRAP_OPTIONS.find((item) => {
			return item?.value === appliedWrap;
		});

		if (wrapValue) {
			setWrapValue(wrapValue);
		}
	}
};

function useTextWrapper({
	fields = [],
	hotTableRef,
	setView = () => {},
	socket = {},
	columnMeta = "",
	textWrapped = {},
	setTextWrapped = () => {},
}) {
	const { tableId, viewId, assetId: baseId } = useDecodedUrlParams();
	const parsedColumnMeta = parseColumnMeta({ columnMeta });

	const [wrapValue, setWrapValue] = useState({
		label: "Ellipses Text",
		value: "ellipses",
	});
	const [isCellSelected, setIsCellSelected] = useState(false);

	const onWrapTextChange = (e, val) => {
		const hotInstance = hotTableRef?.current?.hotInstance;

		const getSelectionColumns = hotInstance?.getSelected(); // returns [[startRow, startCol, endRow, endCol]]

		if (isEmpty(getSelectionColumns)) return;

		let fieldIndexesToWrap = [];

		if (getSelectionColumns.length > 1) {
			fieldIndexesToWrap = getSelectionColumns.map(([, , , endCol]) => {
				return endCol;
			});
		} else if (getSelectionColumns.length === 1) {
			const [[, startCol, , endCol]] = getSelectionColumns;

			const minCol =
				Math.min(startCol, endCol) < 0 ? 0 : Math.min(startCol, endCol);
			const maxCol = Math.max(startCol, endCol);

			fieldIndexesToWrap = createRange(minCol, maxCol);
		}

		const columnMeta = fieldIndexesToWrap.map((fieldIndex) => {
			const dbFieldname = hotInstance?.colToProp(fieldIndex);

			const currentFieldId = fields?.find(
				(field) => field.dbFieldName === dbFieldname,
			)?.id;

			parsedColumnMeta[currentFieldId] = {
				...(parsedColumnMeta[currentFieldId] || {}),
				text_wrap: val.value,
			};

			return {
				id: currentFieldId,
				text_wrap: val.value,
			};
		});

		const payload = {
			columnMeta: columnMeta,
			viewId,
			baseId,
			tableId,
		};

		setWrapValue(val);
		setTextWrapped((prev) => {
			const updatedState = { ...prev };
			columnMeta.forEach(({ id, text_wrap }) => {
				if (id) {
					updatedState[id] = { text_wrap };
				}
			});
			return updatedState;
		});

		setView((prev) => ({
			...prev,
			columnMeta: JSON.stringify(parsedColumnMeta),
		}));

		socket.emit("update_column_meta", payload);
	};

	useEffect(() => {
		if (!hotTableRef?.current) return;

		const hotInstance = hotTableRef.current.hotInstance;

		hotInstance?.addHook("afterSelection", () =>
			handleSelection({
				hotInstance,
				fields,
				textWrapped,
				setWrapValue,
				setIsCellSelected,
			}),
		);
		hotInstance?.addHook("afterDeselect", () => setIsCellSelected(false));

		return () => {
			if (hotInstance && !hotInstance.isDestroyed) {
				hotInstance?.removeHook("afterSelection", handleSelection);
				hotInstance?.removeHook("afterDeselect", () =>
					setIsCellSelected(false),
				);
			}
		};
	}, [fields, textWrapped]);

	return {
		wrapValue,
		onWrapTextChange,
		isCellSelected,
	};
}

export default useTextWrapper;
