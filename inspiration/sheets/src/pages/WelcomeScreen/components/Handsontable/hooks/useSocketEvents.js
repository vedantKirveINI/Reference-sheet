import isEmpty from "lodash/isEmpty";
import { showAlert } from "oute-ds-alert";

import { getUpdatedRecordForIdentifierCheck } from "../utils/getUpdatedRecordFOrIdentifierCheck";
import {
	getRecordsWithoutIdAndViewId,
	getUpdatedLoadingFields,
	getEnrichmentLoadingFields,
	removeDeletedFieldsFromRecords,
	resizeColumnWidths,
} from "../utils/helper";
import {
	insertMultipleRecords,
	insertNewField,
	insertMultipleFields,
	getInsertedRecordIndex,
	updateCellData,
} from "../utils/updateTableData";

const useSocketEvents = ({
	view = {},
	fields = [],
	hotTableRef,
	rowOrderKey = "",
	dataReceived = {},
	setView,
	setTableData,
	setDataReceived,
	setAddRecordIndex,
	setRecordLoading,
	getViews = () => {},
	parsedColumnMeta = {},
	setTextWrapped = () => {},
	socket = {},
	setCellLoading,
}) => {
	const { records = [] } = dataReceived || {};
	const { filter = {}, sort = {} } = view || {};
	const { sortObjs = [] } = sort || {};

	function handleCreatedFieldEvent(newFieldData) {
		insertNewField({
			rowOrderKey,
			payload: newFieldData,
			dataReceived,
			setDataReceived,
			setTableData,
			hotTableRef,
		});

		const { id: fieldId, type: fieldType } = newFieldData || {};

		if (fieldType === "FORMULA") {
			setCellLoading((prev) => {
				const updated = { ...prev };

				records.forEach((record) => {
					const recordId = record?.__id;
					if (recordId) {
						if (!updated[recordId]) {
							updated[recordId] = {};
						}
						updated[recordId][fieldId] = true;
					}
				});

				return updated;
			});
		}

		showAlert({
			type: "success",
			message: "New Column Added",
		});

		// calling getViews here to get updated fields in TableSubHeader(filter and sort)
		getViews();
	}

	function handleUpdatedFieldSettingsEvent(updatedFieldData) {
		const { isExpressionUpdate, updatedFields } = updatedFieldData || {};

		// Update fields logic outside setState
		const { fields: prevFields = [] } = dataReceived || {};
		const previousFieldsArray = [...prevFields];

		if (isEmpty(updatedFields) || !Array.isArray(updatedFields)) {
			return;
		}

		// Set loading state for all fields if it's an expression update
		if (isExpressionUpdate) {
			setCellLoading((prev) => {
				const updated = { ...prev };

				// Set loading for all records in all updated fields
				updatedFields.forEach((field) => {
					if (["ENRICHMENT"].includes(field?.type)) return;

					records.forEach((record) => {
						const recordId = record?.__id;
						if (recordId) {
							if (!updated[recordId]) {
								updated[recordId] = {};
							}
							updated[recordId][field.id] = true;
						}
					});
				});

				return updated;
			});
		}

		// Update each field in the updatedFields array
		updatedFields.forEach((fieldUpdate) => {
			const fieldIndex = previousFieldsArray.findIndex(
				(field) => field?.id === fieldUpdate?.id,
			);

			if (fieldIndex !== -1) {
				previousFieldsArray[fieldIndex] = {
					...previousFieldsArray[fieldIndex],
					...fieldUpdate,
				};
			}
		});

		// Update state with the computed result
		setDataReceived((prevData) => ({
			...prevData,
			fields: previousFieldsArray,
		}));

		// calling getViews here to get updated fields in TableSubHeader(filter and sort)
		getViews();
	}

	function handleRecordFetchEvent(data) {
		const { records = [], fields = [] } = data || {};

		const updatedRecords = getRecordsWithoutIdAndViewId(
			records,
			rowOrderKey,
		);

		hotTableRef.current?.hotInstance?.loadData(updatedRecords);

		resizeColumnWidths({ hotTableRef, parsedColumnMeta, fields });

		setTableData(() => [...updatedRecords, {}]);

		setDataReceived({
			fields: fields,
			records,
		});
		setRecordLoading(false);
		setView((prev) => ({
			...prev,
			fields: fields,
		}));
	}

	function handleUpdatedRowEvent(updatedRowDataReceived) {
		if (!isEmpty(filter) || !isEmpty(sortObjs)) {
			// updated record will be reflect on UI via recordsFetch socket event. recordsFetch is also emitted along with updated_row
			return;
		}

		const cellsToBeUpdated = [];

		const formulaFields =
			fields
				?.filter((fieldData) => fieldData.type === "FORMULA")
				?.map((fieldData) => fieldData.id) || [];

		// Get all enrichment fields for checking identifiers
		const enrichmentFields = fields.filter(
			(field) => field?.type === "ENRICHMENT",
		);

		const cellsToBeLoaded = {};

		(updatedRowDataReceived || []).forEach((rowData) => {
			const {
				fields_info: fieldsInfo = [],
				row_id: rowId,
				enrichedFieldId = "",
			} = rowData || {};

			const currentRecordIndex = records?.findIndex(
				(record) => record?.__id === rowId,
			);

			const currentRecord = records?.[currentRecordIndex];

			// Create updated record for identifier checking
			const updatedRecord = getUpdatedRecordForIdentifierCheck({
				currentRecord,
				fieldsInfo,
				fields,
			});

			// If this was an enrichment update, mark the enrichment field as no longer loading
			// This removes the loading state from the enrichment field
			if (enrichedFieldId) {
				cellsToBeLoaded[rowId] = {
					...cellsToBeLoaded[rowId],
					[enrichedFieldId]: false,
				};
			}

			(fieldsInfo || []).forEach((fieldInfo) => {
				const { field_id: fieldId, data } = fieldInfo || {};

				const columnIndex = fields?.findIndex(
					(field) => field?.id === fieldId,
				);

				// Handle formula fields (existing logic)
				if (formulaFields.includes(fieldId)) {
					if (!cellsToBeLoaded[rowId]) {
						cellsToBeLoaded[rowId] = {};
					}
					cellsToBeLoaded[rowId][fieldId] = false;
				}

				// Handle enrichment field auto-update logic
				enrichmentFields.forEach((enrichmentField) => {
					const { id: enrichmentFieldId, options = {} } =
						enrichmentField;
					const { config = {}, autoUpdate } = options;
					const { identifier = [] } = config;

					// Case 1: This updated field IS the enrichment field itself
					// This means the enrichment field is being updated, so set it to loading
					if (fieldId === enrichmentFieldId) {
						if (!cellsToBeLoaded[rowId]) {
							cellsToBeLoaded[rowId] = {};
						}
						cellsToBeLoaded[rowId][enrichmentFieldId] = true;
					}
					// Case 2: This updated field is an identifier for an enrichment field
					// If autoUpdate is enabled and this field is used as an identifier,
					// trigger the enrichment field to update ONLY if required identifiers have data
					else if (
						autoUpdate &&
						identifier.length > 0 &&
						updatedRecord
					) {
						const isIdentifierField = identifier.some(
							(identifierField) =>
								identifierField.field_id === fieldId,
						);

						if (isIdentifierField) {
							const allIdentifiersDbFieldNames = {};

							identifier.forEach((elem) => {
								if (elem.required) {
									allIdentifiersDbFieldNames[
										elem.dbFieldName
									] = elem;
								}
							});

							let hasRequiredIdentifierData = true;

							Object.keys(allIdentifiersDbFieldNames).forEach(
								(dbFieldName) => {
									// Use updatedRecord instead of currentRecord
									const value = updatedRecord[dbFieldName];

									if (!value || value === "") {
										hasRequiredIdentifierData = false;
									}
								},
							);

							// Only set enrichment field to loading if required identifiers have data
							if (hasRequiredIdentifierData) {
								if (!cellsToBeLoaded[rowId]) {
									cellsToBeLoaded[rowId] = {};
								}
								// Set enrichment field to loading state when its identifier is updated
								cellsToBeLoaded[rowId][enrichmentFieldId] =
									true;
							}
						}
					}
				});

				cellsToBeUpdated.push([currentRecordIndex, columnIndex, data]);
			});
		});

		hotTableRef.current.hotInstance.setDataAtCell(
			cellsToBeUpdated,
			"updated_row",
		);

		setDataReceived((prevData) => {
			let updatedRecords = [...prevData.records];

			cellsToBeUpdated.forEach(
				([currentRecordIndex, columnIndex, data]) => {
					const fieldName = fields?.[columnIndex]?.dbFieldName;

					// Update the records with the new cell data
					updatedRecords = updateCellData({
						currentRowIndex: currentRecordIndex,
						fieldName,
						cellData: data,
						dataReceived: prevData,
					});
				},
			);

			return { ...prevData, records: updatedRecords };
		});

		setCellLoading((prev) => {
			const updated = { ...prev };

			// Properly merge the nested objects
			Object.keys(cellsToBeLoaded).forEach((rowId) => {
				if (!updated[rowId]) {
					updated[rowId] = {};
				}
				updated[rowId] = {
					...updated[rowId],
					...cellsToBeLoaded[rowId],
				};
			});

			return updated;
		});
	}

	function handleCreatedRowEvent(insertedRowData) {
		// Get formula fields loading state
		const updateLoadingFields = getUpdatedLoadingFields({
			records: insertedRowData,
			fields,
		});

		// Get enrichment fields that should be set to loading
		const enrichmentLoadingFields = getEnrichmentLoadingFields({
			records: insertedRowData,
			fields,
		});

		// Combine both loading states
		const allLoadingFields = {
			...updateLoadingFields,
			...enrichmentLoadingFields,
		};

		if (!isEmpty(allLoadingFields)) {
			setCellLoading((prev) => {
				const updated = { ...prev };

				insertedRowData.forEach((record) => {
					const recordId = record?.__id;
					if (recordId) {
						updated[recordId] = { ...allLoadingFields };
					}
				});

				return updated;
			});
		}

		const {
			socket_id,
			field_id: fieldId,
			__status,
			...record
		} = insertedRowData[0];

		if (!isEmpty(filter) || !isEmpty(sortObjs)) {
			// created record will be reflect on UI via recordsFetch socket event. recordsFetch is also emitted along with create_row
			return;
		}

		const insertIndex = getInsertedRecordIndex(
			{ record },
			setDataReceived,
			setTableData,
			dataReceived,
			rowOrderKey,
		);

		setAddRecordIndex(insertIndex);
	}

	function handleMultipleCreatedRowEvent(createdRowsData) {
		insertMultipleRecords({
			newRecords: createdRowsData,
			setDataReceived,
			setTableData,
			dataReceived,
			rowOrderKey,
		});

		// Get formula fields loading state
		const updateLoadingFields = getUpdatedLoadingFields({
			records: createdRowsData,
			fields,
		});

		// Get enrichment fields that should be set to loading
		const enrichmentLoadingFields = getEnrichmentLoadingFields({
			records: createdRowsData,
			fields,
		});

		// Combine both loading states
		const allLoadingFields = {
			...updateLoadingFields,
			...enrichmentLoadingFields,
		};

		if (!isEmpty(allLoadingFields)) {
			setCellLoading((prev) => {
				const updated = { ...prev };

				createdRowsData.forEach((record) => {
					const recordId = record?.__id;
					if (recordId) {
						updated[recordId] = { ...allLoadingFields };
					}
				});

				return updated;
			});
		}
	}

	const handleDeleteRecordEvent = (data) => {
		const deletedRowIds = (data || [])?.map((row) => row?.__id);

		const updatedRecord = records.filter((record) => {
			const rowId = record?.__id;
			return !deletedRowIds.includes(rowId);
		});

		const formattedRecords = getRecordsWithoutIdAndViewId(
			updatedRecord,
			rowOrderKey,
		);

		setTableData(() => [...formattedRecords, {}]);

		setDataReceived((prev) => ({
			...prev,
			records: updatedRecord,
		}));

		hotTableRef.current.hotInstance.deselectCell();
	};

	function handleAfterRowMoveEvent() {
		if (isEmpty(records)) return;
	}

	function handleDeleteFieldEvent(data) {
		hotTableRef.current.columnSettings = [];

		const deletedFieldsIds = [];
		const deletedFieldsDbFieldName = {};

		(data || []).forEach((column) => {
			const { id = "", dbFieldName = "", type = "" } = column || {};

			// TODO: add logic to remove the deleted columns ref

			deletedFieldsIds.push(id);

			if (["CREATED_TIME"].includes(type)) return;
			// __created_time dbFieldName is by default present in record data, dont remove it.
			// Its dbFieldName is directly linked to CREATED_TIME field when its field is created.
			deletedFieldsDbFieldName[dbFieldName] = dbFieldName;
		});

		setDataReceived((prev) => {
			const { records: prevRecords = [], fields: prevFields = [] } =
				prev || {};

			const updatedRecords = removeDeletedFieldsFromRecords(
				prevRecords,
				deletedFieldsDbFieldName,
			);

			const udpatedFields = (prevFields || [])?.filter((field) => {
				const fieldId = field?.id;
				return !deletedFieldsIds.includes(fieldId);
			});

			return {
				records: updatedRecords,
				fields: udpatedFields,
			};
		});

		setTableData((prevRecords) => {
			const updatedRecords = removeDeletedFieldsFromRecords(
				prevRecords,
				deletedFieldsDbFieldName,
			);

			return updatedRecords;
		});

		hotTableRef.current.hotInstance.deselectCell();
		// calling getViews here to get updated fields in TableSubHeader(filter and sort)
		getViews();
	}

	function handleSocketErrorEvent(data) {
		console.error("Socket error: ", data);
	}

	function handleSocketConnectionErrorEvent() {
		console.error("Socket connection error");
	}

	function handleUpdatedFilterEvent(data) {
		setView((prev) => ({ ...prev, filter: data?.filter }));
	}

	function handleUpdatedSortEvent(data) {
		setView((prev) => ({ ...prev, sort: data?.sort }));
	}

	function handleColumnMetaChange(data) {
		const { columnMeta = [], socket_id = "" } = data || {};

		if (socket.id === socket_id || isEmpty(data) || !data?.columnMeta)
			return;

		const updatedTextWrap = {};

		// Update the columnMeta with new data
		columnMeta.forEach((meta) => {
			if (meta?.id) {
				parsedColumnMeta[meta.id] = {
					...(parsedColumnMeta[meta.id] || {}),
					width: meta?.width ?? parsedColumnMeta[meta.id]?.width,
					text_wrap:
						meta?.text_wrap ?? parsedColumnMeta[meta.id]?.text_wrap,
				};

				if (meta?.text_wrap) {
					updatedTextWrap[meta.id] = meta.text_wrap;
				}
			}
		});

		resizeColumnWidths({ hotTableRef, fields, parsedColumnMeta });
		setTextWrapped((prev) => ({ ...prev, ...updatedTextWrap }));

		setView((prev) => ({
			...prev,
			columnMeta: JSON.stringify(parsedColumnMeta),
		}));
	}

	function handleFormulaFieldErrorsEvent(data) {
		const errorMap = {};
		const loadingErrorMap = {};

		// Update the fields state with error information
		setDataReceived((prevData) => {
			const { fields: prevFields = [] } = prevData || {};

			// Create a map of field IDs to their error status
			(data || []).forEach((errorField) => {
				const fieldId = errorField.id;
				const hasError = errorField?.computedFieldMeta?.hasError;

				// Map for all fields (including enrichment)
				errorMap[fieldId] = hasError;

				// Map for loading state (excluding enrichment)
				if (!["ENRICHMENT"].includes(errorField?.type)) {
					loadingErrorMap[fieldId] = hasError;
				}
			});

			// Update fields with error information
			const updatedFields = prevFields.map((field) => {
				const hasError = errorMap[field.id];

				// Only update if this field has error information
				if (hasError !== undefined) {
					return {
						...field,
						computedFieldMeta: {
							...field.computedFieldMeta,
							hasError: hasError,
						},
					};
				}

				return field;
			});

			return {
				...prevData,
				fields: updatedFields,
			};
		});

		// Set loading state for all fields if it's an expression update
		if (!isEmpty(loadingErrorMap)) {
			setCellLoading((prev) => {
				const updated = { ...prev };

				records.forEach((record) => {
					const recordId = record?.__id;
					if (recordId) {
						if (!updated[recordId]) {
							updated[recordId] = {};
						}
						Object.keys(loadingErrorMap).forEach((fieldId) => {
							updated[recordId][fieldId] =
								loadingErrorMap[fieldId];
						});
					}
				});

				return updated;
			});
		}
	}

	function hanldeMultipleFieldsCreationEvent(data) {
		const fieldsArray = data || [];

		if (!Array.isArray(fieldsArray) || fieldsArray.length === 0) {
			return;
		}

		insertMultipleFields({
			rowOrderKey,
			fieldsArray,
			dataReceived,
			setDataReceived,
			setTableData,
			hotTableRef,
		});

		const fieldsToBeLoaded = {};

		fieldsArray.forEach((fieldData) => {
			const { id: fieldId, type: fieldType } = fieldData || {};

			if (fieldType === "FORMULA") {
				fieldsToBeLoaded[fieldId] = true;
			}
		});

		if (!isEmpty(fieldsToBeLoaded)) {
			setCellLoading((prev) => ({
				...prev,
				...fieldsToBeLoaded,
			}));
		}

		showAlert({
			type: "success",
			message: `${fieldsArray.length} New Column${fieldsArray.length > 1 ? "s" : ""} Added`,
		});

		// calling getViews here to get updated fields in TableSubHeader(filter and sort)
		getViews();
	}

	function handleEnrichmentRunButtonClick(data) {
		const { id: rowId, enrichedFieldId: fieldId } = data || {};

		setCellLoading((prev) => {
			const updated = { ...prev };

			if (!updated[rowId]) {
				updated[rowId] = {};
			}

			updated[rowId][fieldId] = true;
			return updated;
		});
	}

	return {
		handleCreatedFieldEvent,
		handleRecordFetchEvent,
		handleAfterRowMoveEvent,
		handleCreatedRowEvent,
		handleUpdatedRowEvent,
		handleDeleteFieldEvent,
		handleDeleteRecordEvent,
		handleSocketErrorEvent,
		handleUpdatedFieldSettingsEvent,
		handleSocketConnectionErrorEvent,
		handleUpdatedFilterEvent,
		handleUpdatedSortEvent,
		handleMultipleCreatedRowEvent,
		handleColumnMetaChange,
		handleFormulaFieldErrorsEvent,
		hanldeMultipleFieldsCreationEvent,
		handleEnrichmentRunButtonClick,
	};
};

export default useSocketEvents;
