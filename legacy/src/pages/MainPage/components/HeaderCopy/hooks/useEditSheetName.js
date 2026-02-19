import { showAlert } from "@/lib/toast";
import { useCallback, useState, useRef, useEffect } from "react";

import useRequest from "@/hooks/useRequest";
import truncateName from "@/utils/truncateName";

function useEditSheetName({ sheet = {}, setSheet = () => {} }) {
	const textFieldRef = useRef(null);
	const [name, setName] = useState(sheet?.name || "Untitled Sheet");

	useEffect(() => {
		setName(sheet?.name || "Untitled Sheet");
	}, [sheet?.name]);

	const [{}, trigger] = useRequest(
		{
			method: "put",
			url: "/base/update_base_sheet_name",
		},
		{
			manual: true,
		},
	);

	const updatedSheetName = useCallback(
		async (data) => {
			try {
				const editedSheetName = await trigger({ data });
				const updatedName =
					editedSheetName?.data?.name || data?.name || "Untitled Sheet";

				document.title = updatedName;
				setSheet((prev) => ({ ...prev, name: updatedName }));

				showAlert({
					type: "success",
					message: "Sheet name updated successfully",
				});
			} catch (error) {
				const { isCancel } = error || {};

				if (isCancel) return;

				showAlert({
					type: "error",
					message:
						truncateName(error?.response?.data?.message, 50) ||
						"Something went wrong",
				});

				setName(document.title);
				setSheet((prev) => ({ ...prev, name: document.title }));
			}
		},
		[trigger, setSheet],
	);

	const saveSheetName = useCallback(() => {
		const newSheetName = name?.trim() ? name : "Untitled Sheet";

		setName(newSheetName);

		if (newSheetName === sheet?.name) return;

		setSheet((prev) => ({ ...prev, name: newSheetName }));
		updatedSheetName({ id: sheet?.id, name: newSheetName });
	}, [name, sheet?.id, sheet?.name, setName, setSheet, updatedSheetName]); // Prevent unnecessary re-renders

	function handleClickOutside(event) {
		if (
			textFieldRef.current &&
			!textFieldRef.current.contains(event.target)
		) {
			textFieldRef.current.blur();
		}
	}

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, [saveSheetName]); //  No unnecessary dependencies

	function handleNameEdit(e) {
		setName(e.target.value);
	}

	return {
		handleNameEdit,
		saveSheetName,
		name,
		textFieldRef,
	};
}

export default useEditSheetName;
