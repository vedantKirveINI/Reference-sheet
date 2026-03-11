import Dialog from "oute-ds-dialog";
import React from "react";

import Content from "./Content";
import Footer from "./Footer";
import DeleteFieldTitle from "./Header";
import useDeleteHandler from "./hooks/useDeleteHandler";

function DeleteField({
	setIsDeleteFieldOpen = () => {},
	isDeleteFieldOpen = {},
}) {
	const {
		isDontAskChecked,
		setIsDontAskChecked,
		handleSave = () => {},
		dialogConfig,
		loading = false,
	} = useDeleteHandler({
		setIsDeleteFieldOpen,
		isDeleteFieldOpen,
	});

	const { iconName, title, footerLabel, showCheckbox, content } =
		dialogConfig || {};

	return (
		<Dialog
			data-outside-ignore="delete-dialog"
			open={isDeleteFieldOpen}
			showFullscreenIcon={false}
			onClose={() => setIsDeleteFieldOpen(false)}
			dialogWidth="40.625rem"
			dialogHeight="15.625rem"
			dialogTitle={<DeleteFieldTitle title={title} iconName={iconName} />}
			dialogContent={<Content content={content} />}
			onKeyDown={(e) => e.stopPropagation()}
			dialogActions={
				<Footer
					onSave={handleSave}
					onClose={() => setIsDeleteFieldOpen(false)}
					footerLabel={footerLabel}
					isDontAskChecked={isDontAskChecked}
					setIsDontAskChecked={setIsDontAskChecked}
					loading={loading}
					showCheckbox={showCheckbox}
				/>
			}
			removeContentPadding
			draggable={false}
		/>
	);
}

export default DeleteField;
