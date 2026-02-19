import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
                        onOpenChange={(open) => {
                                if (!open) {
                                        setShow(false);
                                        close();
                                }
                        }}
                >
                        <DialogContent
                                style={{ maxWidth: "34.375rem" }}
                                onKeyDown={(e) => e.stopPropagation()}
                                onInteractOutside={(e) => e.preventDefault()}
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
                                <DialogFooter>
                                        <Footer
                                                handleSubmit={handleSubmit(onSubmit)}
                                                handleAllFieldsClear={handleAllFieldsClear}
                                        />
                                </DialogFooter>
                        </DialogContent>
                </Dialog>
        );
};

export default Address;
