import React from "react";

import getField from "../../../common/forms/getField";
import useGroupByContentHandler from "../hooks/useGroupByContentHandler";
import GroupByFooter from "../GroupByFooter";
import GroupByTitle from "../GroupByTitle";

import styles from "./styles.module.scss";

function GroupByContent({
	onClose = () => {},
	onSave = () => {},
	loading = false,
	updatedGroupObjs = [],
	groupByFieldOptions = [],
}) {
	const { control, handleSubmit, errors, onSubmit, controls } =
		useGroupByContentHandler({
			onSave,
			updatedGroupObjs,
			groupByFieldOptions,
		});

	return (
		<div className={styles.group_by_content_container}>
			<GroupByTitle />

			<form className={styles.group_by_form}>
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

			<GroupByFooter
				onGroupBy={handleSubmit(onSubmit)}
				onClose={onClose}
				loading={loading}
			/>
		</div>
	);
}

export default GroupByContent;
