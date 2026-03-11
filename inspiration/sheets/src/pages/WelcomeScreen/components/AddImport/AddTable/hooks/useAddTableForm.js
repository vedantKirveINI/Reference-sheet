import { showAlert } from "oute-ds-alert";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import useDecodedUrlParams from "../../../../../../hooks/useDecodedUrlParams";
import useRequest from "../../../../../../hooks/useRequest";
import { encodeParams } from "../../../../../../utils/encodeDecodeUrl";
import getTableControls from "../configuration/getTableControls";

const useAddTableForm = ({
	setOpen = () => {},
	baseId = "",
	setView,
	leaveRoom,
}) => {
	const {
		decodedParams,
		setSearchParams,
		tableId = "",
	} = useDecodedUrlParams();

	const [{ loading }, trigger] = useRequest(
		{
			method: "post",
			url: "/table/create_table",
		},
		{ manual: true },
	);

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm();

	const onSubmit = async (formData) => {
		if (loading) {
			return;
		}

		const payload = {
			...formData,
			baseId,
		};

		const { data = {} } = await createTable(payload);
		const { table, view } = data || {};

		setView(view);

		const updatedParams = {
			...decodedParams,
			t: table?.id || "",
			v: view?.id || "",
		};

		const newEncodedParams = encodeParams(updatedParams);

		await leaveRoom({ roomId: tableId });

		setSearchParams({ q: newEncodedParams });

		onClose();
		reset();
	};

	const controls = getTableControls({ handleSubmit, submit: onSubmit });

	const createTable = useCallback(
		async (payload) => {
			try {
				const response = await trigger({
					data: payload,
				});

				showAlert({
					type: "success",
					message: "Table Created Successfully",
				});

				return response;
			} catch (error) {
				const { isCancel } = error || {};

				if (isCancel) return;

				showAlert({
					type: "error",
					message: `${
						error?.response?.data?.message || "Something went wrong"
					}`,
				});
			}
		},
		[trigger],
	);

	const onClose = () => {
		setOpen(() => "");
	};

	const handleDiscard = () => {
		onClose();
		reset();
	};

	return {
		controls,
		control,
		handleSubmit,
		errors,
		onSubmit,
		handleDiscard,
		loading,
	};
};

export default useAddTableForm;
