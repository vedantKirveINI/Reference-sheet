import Dialog from "oute-ds-dialog";

import { useAddressHandler } from "./hooks/useAddressHandler";

import AddressContent from "./AddressContent";
import Footer from "./Footer";
import Header from "./Header";

const Address = ({
	initialValue = "",
	onChange = () => {},
	onCellUpdate,
	cellProperties = {},
	show,
	setShow = () => {},
	close = () => {},
}) => {
	const {
		controls = [],
		register = () => {},
		errors = {},
		handleAllFieldsClear = () => {},
		handleSubmit = () => {},
		onSubmit = () => {},
	} = useAddressHandler({
		initialValue,
		cellProperties,
		onChange,
		onCellUpdate,
		setShow,
	});

	return (
		<Dialog
			open={show}
			onClose={() => {
				setShow(false);
				close();
			}}
			draggable={false}
			showFullscreenIcon={false}
			hideBackdrop={false}
			dialogWidth="34.375rem"
			dialogHeight="auto"
			dialogTitle={<Header />}
			dialogContent={
				<AddressContent
					controls={controls}
					errors={errors}
					register={register}
				/>
			}
			dialogActions={
				<Footer
					handleSubmit={handleSubmit(onSubmit)}
					handleAllFieldsClear={handleAllFieldsClear}
				/>
			}
			onKeyDown={(e) => e.stopPropagation()}
		/>
	);
};

export default Address;
