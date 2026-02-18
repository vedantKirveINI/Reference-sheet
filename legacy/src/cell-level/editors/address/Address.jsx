import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
			onOpenChange={(v) => {
				if (!v) {
					setShow(false);
					close();
				}
			}}
		>
			<DialogContent
				className="max-w-[34.375rem]"
				onKeyDown={(e) => e.stopPropagation()}
			>
				<DialogHeader>
					<DialogTitle asChild>
						<Header />
					</DialogTitle>
				</DialogHeader>
				<AddressContent
					controls={controls}
					errors={errors}
					register={register}
				/>
				<Footer
					handleSubmit={handleSubmit(onSubmit)}
					handleAllFieldsClear={handleAllFieldsClear}
				/>
			</DialogContent>
		</Dialog>
	);
};

export default Address;
