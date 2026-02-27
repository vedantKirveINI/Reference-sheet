import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useDecodedUrlParams from "../../../../../hooks/useDecodedUrlParams";
import useRestoreAsset from "../../../hooks/useRestoreAsset";

function useBinModalHandler() {
	const [open, setOpen] = useState(true);

	const navigate = useNavigate();
	const { assetId } = useDecodedUrlParams();

	const { restoreAsset = () => {}, loading } = useRestoreAsset();

	const handleGoToHome = () => {
		navigate("/");
	};

	const handleRestoreSheet = async () => {
		const { status } = await restoreAsset(assetId);

		if (status === "success") {
			setOpen(false);
		}
	};

	return {
		handleGoToHome,
		handleRestoreSheet,
		loading,
		open,
	};
}

export default useBinModalHandler;
