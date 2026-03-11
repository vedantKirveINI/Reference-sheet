import React from "react";

import getField from "../../../form/getField";
import useSortContentHandler from "../hooks/useSortContentHandler";
import SortFooter from "../SortFooter";
import SortTitle from "../SortTitle";

import styles from "./styles.module.scss";

function SortContent({
	onClose = () => {},
	onSave = () => {},
	loading = false,
	updatedSortObjs = [],
	sortFieldOptions = [],
}) {
	const { control, handleSubmit, errors, onSubmit, controls } =
		useSortContentHandler({
			onSave,
			updatedSortObjs,
			sortFieldOptions,
		});

	return (
		<div className={styles.sort_content_container}>
			<SortTitle />

			<form className={styles.sort_form}>
				{(controls || []).map((config) => {
					const { name, type } = config || {};
					const Element = getField(type);

					return (
						<Element
							key={name}
							{...config}
							control={control}
							errors={errors}
						/>
					);
				})}
			</form>

			<SortFooter
				onSort={handleSubmit(onSubmit)}
				onClose={onClose}
				loading={loading}
			/>
		</div>
	);
}

export default SortContent;
