import React from "react";

import getField from "../../../common/forms/getField";
import useGroupByContentHandler from "../hooks/useGroupByContentHandler";
import GroupByFooter from "../GroupByFooter";
import GroupByTitle from "../GroupByTitle";

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
                <div className="w-[28rem] max-h-[32rem] flex flex-col bg-[var(--cell-background-color)]">
                        <GroupByTitle />

                        <form className="px-5 py-4 flex-1 overflow-y-auto">
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
