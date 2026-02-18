import React from "react";
import ODSIcon from "@/lib/oute-icon";
import type { IColumn, ICell } from "@/types";
import { CellType } from "@/types";
import QUESTION_TYPE_ICON_MAPPING, {
	QuestionTypeIconKey,
} from "@/constants/questionTypeIconMapping";
import { getFieldEditor } from "../utils/getFieldEditor";

interface IExpandedRecordFieldProps {
	field: IColumn;
	cell: ICell | undefined;
	value?: unknown;
	onChange: (newValue: unknown) => void;
	readonly?: boolean;
}

const getIconKey = (type: string): string => {
	const typeMap: Record<string, string> = {
		String: "SHORT_TEXT",
		Number: "NUMBER",
		DateTime: "DATE",
		Time: "TIME",
		MCQ: "MCQ",
		SCQ: "SCQ",
		YesNo: "YES_NO",
		PhoneNumber: "PHONE_NUMBER",
		ZipCode: "ZIP_CODE",
		Currency: "CURRENCY",
		DropDown: "DROP_DOWN",
		Address: "ADDRESS",
		Signature: "SIGNATURE",
		FileUpload: "FILE_PICKER",
		Ranking: "RANKING",
		Rating: "RATING",
		List: "LIST",
		CreatedTime: "CREATED_TIME",
	};
	return typeMap[type] || "SHORT_TEXT";
};

export const ExpandedRecordField: React.FC<IExpandedRecordFieldProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	const iconKey = getIconKey(field.type);
	const fieldIcon =
		QUESTION_TYPE_ICON_MAPPING[iconKey as QuestionTypeIconKey];

	const isCreatedTime =
		field.type === CellType.CreatedTime || field.type === "CREATED_TIME";
	const createdTimeDisplay =
		cell?.displayData ?? (cell?.data ? String(cell.data) : "");

	const FieldEditor = getFieldEditor(field.type);

	const cellValue = value !== undefined ? value : (cell?.data ?? null);

	return (
		<div className="flex items-center gap-4">
			<div className="flex items-center gap-2 w-36 flex-shrink-0 pt-0.5">
				{fieldIcon && (
					<ODSIcon
						imageProps={{
							src: fieldIcon,
							className: "w-5 h-5",
						}}
					/>
				)}
				<span className="text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">
					{field.name}
				</span>
			</div>

			<div className="flex-1 min-w-0">
				{isCreatedTime ? (
					<div className="text-base py-1">
						{createdTimeDisplay || "—"}
					</div>
				) : (
					<FieldEditor
						field={field}
						cell={cell}
						value={cellValue}
						onChange={onChange}
						readonly={readonly}
					/>
				)}
			</div>
		</div>
	);
};
