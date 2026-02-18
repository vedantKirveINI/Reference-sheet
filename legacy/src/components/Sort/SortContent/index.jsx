import React from "react";

import getField from "../../../common/forms/getField";
import useSortContentHandler from "../hooks/useSortContentHandler";
import SortFooter from "../SortFooter";
import SortTitle from "../SortTitle";

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
                <div className="w-[31.25rem]">
                        <SortTitle />

                        <form className="mb-0 p-5 border-t border-[#cfd8dc] box-border max-h-[18.75rem] overflow-y-auto">
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
