import Intercom, { show, shutdown } from "@intercom/messenger-js-sdk";
import { useEffect, useState, useContext } from "react";

import { SheetsContext } from "../../../../../context/sheetsContext";
import useEditSheetName from "../../../hooks/useEditSheetName";

function useHeader({ sheet = {}, setSheet = () => {} }) {
	const [showShare, setShowShare] = useState(false);

	const { user } = useContext(SheetsContext);

	const {
		name = "",
		saveSheetName = () => {},
		handleNameEdit = () => {},
		textFieldRef,
	} = useEditSheetName({
		sheet,
		setSheet,
	});

	const onShareClick = async () => {
		setShowShare(() => true);
	};

	useEffect(() => {
		if (user?.name && user?.email) {
			Intercom({
				app_id: process.env.REACT_APP_INTERCOM_ID,
				name: user.name,
				email: user.email,
				hide_default_launcher: true,
			});
		}

		return () => {
			shutdown();
		};
	}, [user?.name, user?.email]);

	return {
		name,
		saveSheetName,
		handleNameEdit,
		textFieldRef,
		show,
		showShare,
		setShowShare,
		onShareClick,
	};
}

export default useHeader;
