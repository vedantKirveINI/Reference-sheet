import { HotColumn, HotTable } from "@handsontable/react";
import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.css";
import { registerAllModules } from "handsontable/registry";
import isEmpty from "lodash/isEmpty";
import kebabCase from "lodash/kebabCase";
import { showAlert } from "oute-ds-alert";
import {
	useEffect,
	useMemo,
	useState,
	forwardRef,
	useRef,
	useContext,
} from "react";
import { useCallback } from "react";

import TableSkeleton from "../../../../components/TableSkeleton";
import { WARNING_ICON } from "../../../../constants/Icons/commonIcons";
import QUESTION_TYPE_ICON_MAPPING from "../../../../constants/questionTypeIconMapping";
import { SheetsContext } from "../../../../context/sheetsContext";
import useDecodedUrlParams from "../../../../hooks/useDecodedUrlParams";
import getAssetAccessDetails from "../../utils/getAssetAccessDetails";
import DeleteField from "../DeleteField";
import FieldModal from "../FieldModal";

import ExpandedRow from "./components/ExpandedRow";
import { ALLOWED_CUSTOM_ATTRIBUTES, COLUMN_WIDTH_MAPPING } from "./constants";
import useDeleteData from "./hooks/useDeleteData";
import useProcessEnrichment from "./hooks/useProcessEnrichment";
import useSocketEvents from "./hooks/useSocketEvents";
import styles from "./styles.module.scss";
import { getFieldType } from "./utils/getFieldType";
import {
	getCellRanges,
	getColumnWidths,
	getMaxColumnHeaderHeight,
	parseColumnMeta,
	uncheckAllCheckboxes,
} from "./utils/helper";
import {
	contextMenuConfig,
	customColumnHeader,
	drawCheckboxInRowHeaders,
	dropdownMenuConfig,
	handleAfterColumnMove,
	handleAfterColumnResize,
	handleAfterOnCellMouseOut,
	handleAfterOnCellMouseOver,
	handleAfterOnCellMouseUp,
	handleAfterRowMove,
	handleBeforeCellChange,
	handleBeforeOnCellContextMenu,
	handleBeforeOnCellMouseDown,
	handleBeforePaste,
	handleBeforeSetRangeEnd,
	handleCellDataChange,
	handleColumnDoubleClick,
	handleRowInsert,
	handleBeforeKeyDown,
} from "./utils/hotTableHooksCallbacks";
import { registerHotModules } from "./utils/registerHotModules";

registerAllModules();
registerHotModules();

function HandsOnTable(
	{
		socket,
		view = {},
		setView,
		checkedRowsRef,
		getViews = () => {},
		setTextWrapped,
		textWrapped = "",
		zoomLevel = 100,
	},
	hotTableRef,
) {
	const { assetAccessDetails } = useContext(SheetsContext);
	const { isViewOnly } = getAssetAccessDetails(assetAccessDetails);

	const [tableData, setTableData] = useState([]);
	const [creationModal, setCreationModal] = useState({ open: false });
	const [isDeleteFieldOpen, setIsDeleteFieldOpen] = useState(false);
	const [dataReceived, setDataReceived] = useState({});
	const [isMovable, setIsMovable] = useState({
		row: true,
		column: true,
	});
	const [addRecordIndex, setAddRecordIndex] = useState();
	const [recordLoading, setRecordLoading] = useState(false);
	const [expandedRow, setExpandedRow] = useState({ open: false });
	const [cellLoading, setCellLoading] = useState({});
	const [dynamicColumnHeaderHeight, setDynamicColumnHeaderHeight] =
		useState(32);

	const { fields = [], records = [] } = dataReceived;

	const { assetId: baseId, tableId, viewId } = useDecodedUrlParams();
	const { processEnrichment = () => {} } = useProcessEnrichment();

	const { deleteRecord } = useDeleteData();

	const columnHeaderRef = useRef({});

	const rowOrderKey = `_row_view${viewId}`;

	const { sortObjs = [], manualSort } = useMemo(() => {
		const { sort = {} } = view || {};
		const { sortObjs = [], manualSort } = sort || {};
		return { sortObjs, manualSort };
	}, [view]);

	const { columnMeta = "" } = view || {};
	const parsedColumnMeta = useMemo(() => {
		return parseColumnMeta({ columnMeta });
	}, [columnMeta]);

	const {
		handleCreatedFieldEvent = () => {},
		handleCreatedRowEvent = () => {},
		handleRecordFetchEvent = () => {},
		handleUpdatedRowEvent = () => {},
		handleAfterRowMoveEvent = () => {},
		handleUpdatedFieldSettingsEvent = () => {},
		handleSocketErrorEvent = () => {},
		handleDeleteRecordEvent = () => {},
		handleDeleteFieldEvent = () => {},
		handleSocketConnectionErrorEvent = () => {},
		handleUpdatedFilterEvent = () => {},
		handleUpdatedSortEvent = () => {},
		handleMultipleCreatedRowEvent = () => {},
		handleColumnMetaChange = () => {},
		handleFormulaFieldErrorsEvent = () => {},
		hanldeMultipleFieldsCreationEvent = () => {},
		handleEnrichmentRunButtonClick = () => {},
	} = useSocketEvents({
		view,
		fields,
		socket,
		tableId,
		baseId,
		rowOrderKey,
		hotTableRef,
		dataReceived,
		setView,
		setIsMovable,
		setTableData,
		setDataReceived,
		setRecordLoading,
		setAddRecordIndex,
		getViews,
		parsedColumnMeta,
		columnHeaderRef,
		setCellLoading,
	});

	const renderHot = useCallback(() => {
		if (!hotTableRef?.current?.hotInstance) return; // Prevent errors if ref is not set

		Promise.resolve().then(() => {
			try {
				const shouldRender = Object.values(textWrapped || {}).some(
					({ text_wrap }) => text_wrap === "wrap",
				);

				if (shouldRender) {
					hotTableRef.current.hotInstance.render(); // Trigger re-render
				}
			} catch (error) {
				console.error("Error while rendering Handsontable:", error);
			}
		});
	}, [hotTableRef, textWrapped]);

	useEffect(() => {
		socket.on("connect", async () => {
			await socket.emit("joinRoom", tableId);

			if (socket.connected) {
				await socket.emit("getRecord", {
					tableId,
					baseId,
					viewId,
					should_stringify: true,
				});
				setRecordLoading(true);
			}
		});

		socket.on("recordsFetched", handleRecordFetchEvent);

		socket.on("updated_row", handleUpdatedRowEvent);

		socket.on("created_row", handleCreatedRowEvent);

		socket.on("created_field", handleCreatedFieldEvent);

		socket.on("updated_field", handleUpdatedFieldSettingsEvent);

		socket.on("deleted_records", handleDeleteRecordEvent);

		socket.on("deleted_fields", handleDeleteFieldEvent);

		socket.on("updated_record_orders", handleAfterRowMoveEvent);

		socket.on("connect_error", handleSocketConnectionErrorEvent);

		socket.on("exception", handleSocketErrorEvent);

		socket.on("filter_updated", handleUpdatedFilterEvent);

		socket.on("sort_updated", handleUpdatedSortEvent);

		socket.on("created_rows", handleMultipleCreatedRowEvent);

		socket.on("updated_column_meta", handleColumnMetaChange);

		socket.on("formula_field_errors", handleFormulaFieldErrorsEvent);

		socket.on("created_fields", hanldeMultipleFieldsCreationEvent);

		socket.on("enrichmentRequestSent", handleEnrichmentRunButtonClick);

		return () => {
			socket.off("connect");
			socket.off("recordsFetched", handleRecordFetchEvent);
			socket.off("updated_row", handleUpdatedRowEvent);
			socket.off("created_row", handleCreatedRowEvent);
			socket.off("created_field", handleCreatedFieldEvent);
			socket.off("updated_field", handleUpdatedFieldSettingsEvent);
			socket.off("deleted_records", handleDeleteRecordEvent);
			socket.off("deleted_fields", handleDeleteFieldEvent);
			socket.off("updated_record_orders", handleAfterRowMoveEvent);
			socket.off("connect_error", handleSocketConnectionErrorEvent);
			socket.off("exception", handleSocketErrorEvent);
			socket.off("filter_updated", handleUpdatedFilterEvent);
			socket.off("sort_updated", handleUpdatedSortEvent);
			socket.off("created_rows", handleMultipleCreatedRowEvent);
			socket.off("updated_column_meta", handleColumnMetaChange);
			socket.off("formula_field_errors", handleFormulaFieldErrorsEvent);
			socket.off("created_fields", hanldeMultipleFieldsCreationEvent);
			socket.off("enrichmentRequestSent", handleEnrichmentRunButtonClick);
		};
	}, [
		socket,
		baseId,
		viewId,
		tableId,
		handleCreatedFieldEvent,
		handleRecordFetchEvent,
		handleUpdatedRowEvent,
		handleUpdatedFieldSettingsEvent,
		handleDeleteRecordEvent,
		handleAfterRowMoveEvent,
		handleDeleteFieldEvent,
		handleCreatedRowEvent,
		handleSocketErrorEvent,
		handleSocketConnectionErrorEvent,
		handleUpdatedFilterEvent,
		handleUpdatedSortEvent,
		handleMultipleCreatedRowEvent,
		handleColumnMetaChange,
		handleFormulaFieldErrorsEvent,
		hanldeMultipleFieldsCreationEvent,
		handleEnrichmentRunButtonClick,
	]);

	useEffect(() => {
		if (socket && socket.connected) {
			(async function () {
				await socket.emit("joinRoom", tableId);

				await socket.emit("getRecord", {
					tableId,
					baseId,
					viewId,
					should_stringify: true,
				});
				setRecordLoading(true);
			})();
		}
	}, [baseId, socket, tableId, viewId]);

	useEffect(() => {
		if (!isEmpty(sortObjs) && !manualSort) {
			setIsMovable((prev) => ({ ...prev, row: false }));
		} else {
			setIsMovable((prev) => ({ ...prev, row: true }));
		}
	}, [manualSort, sortObjs]);

	useEffect(() => {
		const hotInstance = hotTableRef.current?.hotInstance;

		if (
			hotInstance &&
			hotInstance.countRows() > 0 &&
			addRecordIndex !== undefined &&
			addRecordIndex !== null
		) {
			const firstFullyVisibleRow = hotInstance.getFirstFullyVisibleRow();
			const lastFullyVisibleRow = hotInstance.getLastFullyVisibleRow();

			// Offset of 2 to handle cases where inserting row above/below viewable records in frame.
			const firstVisibleRowIndexOffset =
				firstFullyVisibleRow > 2
					? firstFullyVisibleRow - 2
					: firstFullyVisibleRow;
			const lastVisibleRowIndexOffset = lastFullyVisibleRow + 2;

			if (
				addRecordIndex >= firstVisibleRowIndexOffset &&
				addRecordIndex <= lastVisibleRowIndexOffset
			) {
				hotInstance.selectRows(addRecordIndex);

				if (addRecordIndex + 1 === hotInstance.countRows() - 1) {
					hotInstance.scrollViewportTo(addRecordIndex, 0);
				}
			}
		}
	}, [addRecordIndex]);

	useEffect(() => {
		if (!isEmpty(fields)) {
			// Calculate column widths once
			const updatedColumnWidths = fields.map((field) => {
				// First try to get width from meta
				const metaWidth = parsedColumnMeta?.[field.id]?.width;
				if (metaWidth) {
					return metaWidth;
				}

				// If no meta width, try to get width from COLUMN_WIDTH_MAPPING based on field type
				const typeWidth = COLUMN_WIDTH_MAPPING[field?.type];
				if (typeWidth) {
					return typeWidth;
				}

				// If neither exists, return default width
				return 150;
			});

			const finalColumnWidths = [...updatedColumnWidths, 95]; // 95 default column width for Add field button

			// Update Handsontable column widths
			hotTableRef.current?.hotInstance?.updateSettings({
				manualColumnResize: finalColumnWidths,
			});

			// Use the same columnWidths for header height calculation
			const maxHeight = getMaxColumnHeaderHeight(
				fields,
				finalColumnWidths,
			);
			setDynamicColumnHeaderHeight(maxHeight);
		}
	}, [fields, parsedColumnMeta]);

	useEffect(() => {
		if (!isEmpty(fields)) {
			const updatedTextWrap = {};

			fields.forEach((field) => {
				const textWrap = parsedColumnMeta[field?.id]?.text_wrap;
				if (textWrap) {
					updatedTextWrap[field.id] = { text_wrap: textWrap };
				}
			});

			setTextWrapped(updatedTextWrap);
		}
	}, [fields, parsedColumnMeta, setTextWrapped]);

	useEffect(() => {
		renderHot();
	}, [textWrapped]);

	useEffect(() => {
		const checkedRows = Array.from(
			checkedRowsRef.current?.checkedRowsMap?.keys(),
		);
		const selectedColumns = Array.from(
			checkedRowsRef.current?.selectedColumnsMap?.keys(),
		);

		const hotInstance = hotTableRef.current?.hotInstance;

		if (!isEmpty(checkedRows) && hotInstance) {
			const selectionRanges = getCellRanges(
				{ checkedRows, columnIndex: hotInstance.countCols() - 2 }, // last visible column
			);

			hotInstance.selectCells(selectionRanges, false);
		}

		// Handle selected columns from ref
		if (!isEmpty(selectedColumns) && hotInstance) {
			// Create column selection ranges for the selected columns
			const columnSelectionRanges = selectedColumns.map((colIndex) => [
				0, // start row (top of table)
				colIndex, // start col
				hotInstance.countRows() - 2, // end row (exclude last row)
				colIndex, // end col
			]);

			hotInstance.selectCells(columnSelectionRanges, false);
		}
	}, [isDeleteFieldOpen, view]);

	useEffect(() => {
		if (!recordLoading) {
			const wtHolder = document.querySelector(".wtHolder");
			if (!wtHolder) return;

			let timeoutId;

			const handleScroll = () => {
				// Disable pointer events during scroll
				wtHolder.style.pointerEvents = "none";

				// Clear previous timeout to avoid multiple executions
				clearTimeout(timeoutId);

				// Re-enable pointer events after scrolling stops
				timeoutId = setTimeout(() => {
					wtHolder.style.pointerEvents = "auto";
				}, 200);
			};

			if (wtHolder) {
				wtHolder.addEventListener("scroll", handleScroll);
			}

			return () => {
				if (wtHolder) {
					wtHolder.removeEventListener("scroll", handleScroll);
				}
				clearTimeout(timeoutId); // Ensure no lingering timeouts
			};
		}
	}, [recordLoading]);

	if (recordLoading) {
		return (
			<div
				className={styles.loading_container}
				style={{
					marginTop: isViewOnly ? "-12px" : "0px", // this is to match the margin-top of the view only container
				}}
			>
				<TableSkeleton />
			</div>
		);
	}

	return (
		<>
			<div
				data-testid="table-container"
				className={`${styles.tableContainer} ht-theme-main ${
					isViewOnly ? styles.view_only_container : ""
				}`}
			>
				<div
					className={styles.column_header_container}
					style={{
						height: `${dynamicColumnHeaderHeight}px`,
						transform: `scale(${zoomLevel / 100})`,
						transformOrigin: "top left",
						width: `${100 / (zoomLevel / 100)}%`,
					}}
				/>
				<div
					style={{
						marginTop: `-${dynamicColumnHeaderHeight}px`,
						transform: `scale(${zoomLevel / 100})`,
						transformOrigin: "top left",
						width: `${100 / (zoomLevel / 100)}%`,
						height: `${100 / (zoomLevel / 100)}%`,
					}}
				>
					<HotTable
						afterOnCellMouseDown={(event, coords) => {
							const hotInstance =
								hotTableRef?.current?.hotInstance;

							// Check if the clicked element is the enrichment run button
							const clickedElement = event.target;
							const enrichmentRunButton = clickedElement.closest(
								"[data-enrichment-run-button]",
							);

							if (enrichmentRunButton && hotInstance) {
								const { row: rowIndex, col: columnIndex } =
									coords || {};

								const enrichmentField = fields[columnIndex];

								const { options = {} } = enrichmentField;
								const { config = {} } = options;
								const { identifier = [] } = config || {};

								const missingRequiredCols = [];

								identifier.forEach((identity) => {
									fields.forEach((field, index) => {
										if (field.id === identity.field_id) {
											const { dbFieldName, required } =
												identity;
											const value =
												hotInstance.getDataAtRowProp(
													rowIndex,
													dbFieldName,
												);

											if (required && !value) {
												missingRequiredCols.push(index);
												return;
											}
										}
									});
								});

								if (missingRequiredCols.length > 0) {
									hotInstance.deselectCell();
									hotInstance.selectCell(
										rowIndex,
										missingRequiredCols[0],
									);

									setTimeout(() => {
										showAlert({
											type: "error",
											message: "Missing inputs",
										});
									}, 100);

									return;
								} else {
									const rowId = records?.[rowIndex]?.__id;
									const fieldId = fields?.[columnIndex]?.id;

									setCellLoading((prev) => {
										const updated = { ...prev };

										if (!updated[rowId]) {
											updated[rowId] = {};
										}

										updated[rowId][fieldId] = true;
										return updated;
									});

									if (rowId && fieldId) {
										// Call the enrichment function
										setTimeout(() => {
											processEnrichment({
												rowId,
												fieldId,
											});
										}, 2000);
									}
								}
							}
						}}
						className={styles.handsontable}
						ref={hotTableRef}
						data={tableData}
						height="100%"
						rowHeights={33}
						rowHeaderWidth={isViewOnly ? 52 : 70}
						columnHeaderHeight={dynamicColumnHeaderHeight}
						autoWrapCol={true}
						manualColumnResize={!isViewOnly}
						manualRowResize={!isViewOnly}
						rowHeaders={true}
						manualRowMove={isMovable?.row && !isViewOnly}
						manualColumnMove={!isViewOnly}
						readOnly={isViewOnly}
						modifyRowHeight={(height) => {
							if (height < 33) return 33;
						}}
						viewportRowRenderingOffset={40}
						afterScrollVertically={() => {
							renderHot();
						}}
						colWidths={getColumnWidths({
							fields,
							parsedColumnMeta,
						})}
						beforeColumnResize={(newSize, col, isDoubleClick) => {
							if (isDoubleClick) {
								handleColumnDoubleClick({
									columnIndex: col,
									fields,
								});
							}
						}}
						afterColumnResize={(newSize, column, isDoubleClick) => {
							handleAfterColumnResize({
								newSize,
								columnIndex: column,
								fields,
								hotTableRef,
								parsedColumnMeta,
								socket,
								setView,
								viewId,
								baseId,
								tableId,
								renderHot,
								isDoubleClick,
							});
						}}
						beforeOnCellMouseDown={(event, coords) => {
							handleBeforeOnCellMouseDown({
								event,
								coords,
								hotTableRef,
								fields,
								setCreationModal,
								checkedRowsRef,
								setExpandedRow,
								isViewOnly,
							});
						}}
						afterOnCellMouseUp={(event, coords, TD) => {
							handleAfterOnCellMouseUp({
								event,
								coords,
								TD,
								hotTableRef,
							});
						}}
						beforeSetRangeEnd={(coords) => {
							handleBeforeSetRangeEnd({ hotTableRef, coords });
						}}
						afterSelection={(
							startRow,
							startCol,
							endRow,
							endCol,
							preventScrolling,
						) => {
							if (
								startRow ===
								hotTableRef.current?.hotInstance?.countRows() -
									1
							) {
								preventScrolling.value = true;
							}
						}}
						afterSelectionEnd={(row) => {
							if (isViewOnly) return;
							if (
								row ===
								hotTableRef.current?.hotInstance?.countRows() -
									1
							) {
								let selectionIndex = row - 1;
								let insertEvent = "row_below";

								if (selectionIndex < 0) {
									selectionIndex = 0;
									insertEvent = "row_above";
								}

								handleRowInsert({
									event: insertEvent,
									selection: [
										{ start: { row: selectionIndex } },
									],
									records,
									rowOrderKey,
									tableId,
									baseId,
									viewId,
									socket,
								});

								if (
									checkedRowsRef.current?.checkedRowsMap?.size
								) {
									uncheckAllCheckboxes(checkedRowsRef);
								}

								hotTableRef.current?.hotInstance?.deselectCell();
							}
						}}
						afterColumnMove={(
							movedColumns,
							finalIndex,
							dropIndex,
							movePossible,
							orderChanged,
						) => {
							return handleAfterColumnMove({
								movedColumns,
								dropIndex,
								orderChanged,
								socket,
								tableId,
								baseId,
								viewId,
								fields,
							});
						}}
						afterRowMove={(
							movedRows,
							finalIndex,
							dropIndex,
							movePossible,
							orderChanged,
						) => {
							return handleAfterRowMove({
								movedRows,
								dropIndex,
								orderChanged,
								records,
								socket,
								baseId,
								tableId,
								viewId,
								rowOrderKey,
							});
						}}
						colHeaders={(index) => {
							if (!isEmpty(fields)) {
								let updatedFields = [...fields];
								if (!isViewOnly) {
									updatedFields.push({
										name: "Add",
										type: "ADD",
									});
								}

								const currField = updatedFields[index];

								const {
									name,
									type,
									computedFieldMeta = {},
								} = currField || {};

								const iconSrc =
									QUESTION_TYPE_ICON_MAPPING?.[type] ||
									QUESTION_TYPE_ICON_MAPPING?.SHORT_TEXT;

								return `
						        <div class="column_container" data-testid="${kebabCase(`column-${type}-${index}`)}">
						            <div class="column_header">
						                <img
						                    src="${iconSrc}"
						                    id="field-type-icon"
						                    alt="icon"
						                    class="row_header_icon"
						                />
						                <span class="column_header_text">
						                    ${name}
						                </span>
						            </div>
									${
										computedFieldMeta?.hasError
											? `
											<img
												src="${WARNING_ICON}"
												id="error-icon"
												alt="icon"
												class="row_header_icon"
											/>
										`
											: ""
									}
						        </div>
						    `;
							}
							return "";
						}}
						afterGetRowHeader={(row, TH) => {
							return drawCheckboxInRowHeaders({
								row,
								TH,
								checkedRowsRef,
								tableData,
								isViewOnly,
							});
						}}
						afterGetColHeader={(col, TH) =>
							customColumnHeader({
								col,
								TH,
								hotTableRef,
								fields,
								checkedRowsRef,
								columnHeaderRef,
								isViewOnly,
							})
						}
						beforeOnCellContextMenu={(event, coords, TD) => {
							handleBeforeOnCellContextMenu({
								event,
								coords,
								TD,
								hotTableRef,
							});
						}}
						contextMenu={contextMenuConfig({
							records,
							rowOrderKey,
							tableId,
							baseId,
							viewId,
							socket,
							checkedRowsRef,
							deleteRecordHandler: deleteRecord,
							setIsDeleteFieldOpen,
							isViewOnly,
						})}
						dropdownMenu={dropdownMenuConfig({
							fields,
							setCreationModal,
							setIsDeleteFieldOpen,
							hotTableRef,
							isViewOnly,
							checkedRowsRef,
						})}
						beforePaste={(data, coords) => {
							return handleBeforePaste(data, coords, hotTableRef);
						}}
						beforeChange={(change, source) => {
							if (source === "CopyPaste.paste") {
								return handleBeforeCellChange(
									change,
									fields,
									records,
									socket,
									tableId,
									baseId,
									viewId,
									rowOrderKey,
								);
							}
						}}
						modifyAutofillRange={(startArea) => {
							// modify autofill range to prevent autofill from going beyond the last editable row and column
							const [startRow, startColumn, endRow, endColumn] =
								startArea;

							const lastEditableRowIndex =
								hotTableRef.current?.hotInstance?.countRows() -
								2;

							const lastEditableColumnIndex =
								hotTableRef.current?.hotInstance?.countCols() -
								2;

							if (endRow > lastEditableRowIndex) {
								return [
									startRow,
									startColumn,
									lastEditableRowIndex,
									endColumn,
								];
							} else if (endColumn > lastEditableColumnIndex) {
								return [
									startRow,
									startColumn,
									endRow,
									lastEditableColumnIndex,
								];
							}
						}}
						afterChange={(change, source) => {
							if (
								[
									"edit",
									"Autofill.fill",
									"UndoRedo.undo",
									"UndoRedo.redo",
									"CopyPaste.cut",
								].includes(source)
							) {
								handleCellDataChange({
									context: change,
									records,
									fields,
									socket,
									tableId,
									baseId,
									viewId,
									rowOrderKey,
								});
							}
						}}
						afterOnCellMouseOver={(event, coords, TD) => {
							handleAfterOnCellMouseOver({
								coords,
								TD,
								hotTableRef,
							});
						}}
						afterOnCellMouseOut={(e, coords, TD) => {
							handleAfterOnCellMouseOut({
								coords,
								TD,
								hotTableRef,
							});
						}}
						cells={(row, col) => {
							const hotInstance =
								hotTableRef?.current?.hotInstance;

							if (hotInstance) {
								const lastColumnIndex =
									hotInstance?.countCols() - 1;

								const lastRowIndex =
									hotInstance?.countRows() - 1;

								if (col === lastColumnIndex) {
									// to blend in the cells of add field column with background
									return {
										className: styles.custom_cell,
									};
								}

								if (row === lastRowIndex) {
									return {
										disableVisualSelection: true,
									};
								}
							}
							return {};
						}}
						outsideClickDeselects={(target) => {
							const customAttribute = target
								.closest("[data-outside-ignore]") // get the closest custom id
								?.getAttribute("data-outside-ignore");

							if (
								ALLOWED_CUSTOM_ATTRIBUTES.includes(
									customAttribute,
								)
							) {
								return false;
							}

							const isRowChecked =
								checkedRowsRef.current?.checkedRowsMap?.size;

							if (isRowChecked) {
								uncheckAllCheckboxes(checkedRowsRef);
								hotTableRef.current.hotInstance.deselectCell();
							}

							return true;
						}}
						afterContextMenuShow={() => {
							const tableBody =
								document.querySelector(".wtHolder");

							tableBody.style.pointerEvents = "none";
						}}
						afterContextMenuHide={() => {
							const tableBody =
								document.querySelector(".wtHolder");
							tableBody.style.pointerEvents = "all";
						}}
						renderAllColumns={true}
						beforeKeyDown={(event) =>
							handleBeforeKeyDown({ event, hotTableRef })
						}
						{...(isViewOnly
							? {
									hiddenRows: {
										rows: [tableData?.length - 1],
									},
									hiddenColumns: {
										columns: [fields?.length],
									},
								}
							: {})}
						licenseKey="non-commercial-and-evaluation" // for non-commercial use only
					>
						{[...fields, {}]?.map((field, index) => {
							const fieldType = field?.type;
							const fieldName = field?.dbFieldName;

							const {
								editor,
								renderer: CustomRenderer,
								validator,
								type,
								readOnly = false,
							} = getFieldType({ fieldType });

							const fieldId = field?.id;
							let wrapValue = "";

							const meta = parsedColumnMeta?.[fieldId] || {}; // Get column meta for the current field

							if (!isEmpty(meta) && meta?.text_wrap) {
								wrapValue = meta.text_wrap; // Use the width from meta if it exists
							}

							return (
								<HotColumn
									className={styles.column_container}
									key={field?.id || index}
									editor={editor}
									validator={validator}
									type={type}
									readOnly={readOnly || isViewOnly}
									allowInvalid={true} // allow invalid values to be entered
									data={fieldName}
									cellProperties={{
										fieldInfo: field,
										wrapClass: wrapValue,
										totalRows: tableData?.length - 1,
										records: records || [],
										zoomLevel: zoomLevel,
									}}
								>
									{index !== fields?.length ? (
										<CustomRenderer
											hot-renderer
											fieldInfo={field} // TODO: remove this as it is already passed in the cellProperties
											hotTableRef={hotTableRef}
											wrapValue={wrapValue} // TODO: remove this as it is already passed in the cellProperties
											cellLoading={cellLoading}
										/>
									) : undefined}
								</HotColumn>
							);
						})}
					</HotTable>
				</div>
			</div>

			{creationModal.open && (
				<FieldModal
					creationModal={creationModal}
					setCreationModal={setCreationModal}
					tableId={tableId}
					baseId={baseId}
					viewId={viewId}
					ref={columnHeaderRef}
					fields={dataReceived?.fields}
				/>
			)}
			{isDeleteFieldOpen && (
				<DeleteField
					isDeleteFieldOpen={isDeleteFieldOpen}
					setIsDeleteFieldOpen={setIsDeleteFieldOpen}
				/>
			)}
			{expandedRow.open && (
				<ExpandedRow
					expandedRow={expandedRow}
					setExpandedRow={setExpandedRow}
					records={records}
					fields={fields}
					hotTableRef={hotTableRef}
				/>
			)}
		</>
	);
}

export default forwardRef(HandsOnTable);
