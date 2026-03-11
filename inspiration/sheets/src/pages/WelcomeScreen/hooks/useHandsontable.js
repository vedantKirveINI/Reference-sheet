import { showAlert } from "oute-ds-alert";
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { SheetsContext } from "../../../context/sheetsContext";
import useDecodedUrlParams from "../../../hooks/useDecodedUrlParams";
import useRequest from "../../../hooks/useRequest";
import { encodeParams, decodeParams } from "../../../utils/encodeDecodeUrl";
import truncateName from "../../../utils/truncateName";
import enrichmentMapping from "../components/FieldModalOptions/constants/enrichmentMapping.json";
import getAssetAccessDetails from "../utils/getAssetAccessDetails";

/**
 * A custom React hook that manages the state and functionality of a Handsontable component in the WelcomeScreen page.
 *
 * This hook handles the creation and retrieval of a sheet, as well as the management of the sheet's views and tables. It also
 * updates the URL parameters based on the current state of the sheet and table.
 *
 * @returns {Object} An object containing the current view, a function to set the view, the current sheet, the list of tables,
 * and a function to handle tab clicks on the tables.
 */
const useHandsontable = ({ socket }) => {
	const [sheet, setSheet] = useState({});
	const [view, setView] = useState({});
	const [tableList, setTableList] = useState();
	const [textWrapped, setTextWrapped] = useState({});
	const [zoomLevel, setZoomLevel] = useState(100); // 100 = 100%

	const { assetAccessDetails } = useContext(SheetsContext);

	const checkedRowsRef = useRef({
		selectedRow: {},
		checkedRowsMap: new Map(),
		selectedColumnsMap: new Map(),
	});
	const hotTableRef = useRef();

	const navigate = useNavigate();

	const { hasAccess, isViewOnly, isInTrash } =
		getAssetAccessDetails(assetAccessDetails);

	const {
		workspaceId = "",
		projectId = "",
		parentId = "",
		assetId = "",
		tableId = "",
		decodedParams = {},
		setSearchParams = () => {},
		viewId = "",
		searchParams = {},
	} = useDecodedUrlParams();

	const [{ loading: createSheetLoading }, trigger] = useRequest(
		{
			method: "post",
			url: "/sheet/create_sheet",
		},
		{ manual: true },
	);

	const [, getSheetTrigger] = useRequest(
		{
			method: "post",
			url: "/sheet/get_sheet",
		},
		{ manual: true },
	);

	const [{ loading: getViewsLoading }, getViewsTrigger] = useRequest(
		{
			method: "post",
			url: "/view/get_views",
		},
		{ manual: true },
	);

	const onCreateSheetSuccess = (response) => {
		const { base, table, view } = response?.data || {};

		const baseId = base?.id || "";
		const tableId = table?.id || "";
		const viewId = view?.id || "";

		setSheet(base);
		// setView(view);
		setTableList([table]);

		document.title = base?.name || "Untitled Sheet";

		const newSheetPath = {
			w: workspaceId,
			pj: projectId,
			pr: parentId,
			a: baseId,
			t: tableId,
			v: viewId,
		};

		const newEncodedPath = encodeParams(newSheetPath);
		setSearchParams({ q: newEncodedPath });
	};

	// take viewId if already in url or pick the first one.
	const getSheetSuccess = (response) => {
		const { data = {} } = response || {};
		const { tables = [] } = data || {};

		setSheet(data);
		setTableList(tables);

		const currTable = tableId
			? tables.find((table) => table.id === tableId)
			: tables[0];

		const { views = [] } = currTable || {};

		const currView = viewId
			? views.find((view) => view?.id === viewId)
			: views?.[0];

		// setView(currView);
		document.title = data?.name || "Untitled Sheet";

		if (!tableId) {
			const updatedParams = {
				...decodedParams,
				t: currTable?.id || "",
				v: currView?.id || "",
			};

			const newEncodedParams = encodeParams(updatedParams);

			setSearchParams({ q: newEncodedParams });
		}
	};

	const createSheet = async (enrichmentKey = null) => {
		try {
			const requestData = {
				workspace_id: workspaceId,
				parent_id: parentId,
			};

			// Add complete enrichment config if enrichment key is provided
			if (enrichmentKey) {
				const enrichmentConfig = enrichmentMapping.enrichments.find(
					(enrichment) => enrichment.key === enrichmentKey,
				);

				if (enrichmentConfig) {
					requestData.enrichment = enrichmentConfig;
				}
			}

			const response = await trigger({
				data: requestData,
			});
			onCreateSheetSuccess(response);
		} catch (error) {
			const { isCancel } = error || {};

			if (isCancel) return;

			showAlert({
				type: "error",
				message: `${
					truncateName(error?.response?.data?.message, 50) ||
					"Something went wrong"
				}`,
			});
		}
	};

	const getSheet = async () => {
		try {
			const sheetResponse = await getSheetTrigger({
				data: {
					baseId: assetId,
					include_views: true,
					include_tables: true,
				},
			});
			getSheetSuccess(sheetResponse);
		} catch (error) {
			const { isCancel } = error || {};

			if (isCancel) return;

			showAlert({
				type: "error",
				message: `${
					truncateName(error?.response?.data?.message, 50) ||
					"Something went wrong"
				}`,
			});
		}
	};

	const leaveRoom = async ({ roomId }) => {
		await socket.emit("leaveRoom", roomId);
	};

	const handleTabClick = async ({ tableInfo, isReplace = false }) => {
		const { id, views } = tableInfo || {};

		const currView = views?.[0] || "";

		// setView(currView);

		const updatedParams = {
			...decodedParams,
			t: id || "",
			v: currView?.id || "",
		};

		const newEncodedParams = encodeParams(updatedParams);

		await leaveRoom({ roomId: tableId });

		if (isReplace) {
			navigate(`/?q=${newEncodedParams}`, {
				replace: true,
			});
			return;
		}

		setSearchParams({ q: newEncodedParams });
		checkedRowsRef.current.selectedRow = {};
		checkedRowsRef.current.checkedRowsMap.clear();
		checkedRowsRef.current.selectedColumnsMap.clear();
	};

	const handleAIEnrichmentClick = (aiOptionValue = "companies") => {
		const currentQuery = searchParams.get("q");
		const decodedParams = decodeParams(currentQuery);
		const updatedParams = {
			...decodedParams,
			ai: aiOptionValue,
		};
		const newEncodedParams = encodeParams(updatedParams);
		navigate("/ai-enrichment/?q=" + newEncodedParams);
	};

	const handleBlankTableClick = (enrichmentKey = null) => {
		createSheet(enrichmentKey);
	};

	const getViews = useCallback(
		async (payload) => {
			const { is_field_required = true } = payload || {};

			try {
				const { data } = await getViewsTrigger({
					data: {
						baseId: assetId,
						id: viewId,
						is_field_required,
					},
				});

				setView(data[0]);

				// return response;
			} catch (error) {
				const { isCancel } = error || {};

				if (isCancel) return;

				showAlert({
					type: "error",
					message: `${
						truncateName(error?.response?.data?.message, 50) ||
						"Could not get View"
					}`,
				});
			}
		},
		[assetId, getViewsTrigger, viewId], // Add dependencies here if needed
	);

	useEffect(() => {
		// inTrash check not added yet, will be used in future scope
		if (assetId && hasAccess) {
			getSheet();
		}
	}, [assetId, tableId, viewId]); //tableId viewId dependency required on table additon/deletion

	useEffect(() => {
		// inTrash check not added yet, will be used in future scope
		if (assetId && hasAccess) {
			getViews();
		}
	}, [assetId, getViews, viewId]);

	return {
		view,
		setView,
		sheet,
		tableList,
		handleTabClick,
		leaveRoom,
		checkedRowsRef,
		setSheet,
		setTableList,
		getViews,
		getViewsLoading,
		hotTableRef,
		textWrapped,
		setTextWrapped,
		hasAccess,
		isViewOnly,
		zoomLevel,
		setZoomLevel,
		isInTrash,
		handleAIEnrichmentClick,
		handleBlankTableClick,
		assetId,
		createSheetLoading,
	};
};

export default useHandsontable;
