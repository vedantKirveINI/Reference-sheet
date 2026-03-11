// Field Editor Registry
// Maps field types to appropriate editor components for expanded record view
// Uses separate form-style editors (like Teable's approach)

import React from "react";
import type { IColumn, ICell } from "@/types";
import { CellType } from "@/types";
import { StringFieldEditor } from "../field-editors/string/StringFieldEditor";
import { NumberFieldEditor } from "../field-editors/number/NumberFieldEditor";
import { DateFieldEditor } from "../field-editors/dateTime/DateFieldEditor";
import { McqFieldEditor } from "../field-editors/mcq/McqFieldEditor";
import { ScqFieldEditor } from "../field-editors/scq/ScqFieldEditor";
import { YesNoFieldEditor } from "../field-editors/yesNo/YesNoFieldEditor";
import { RankingFieldEditor } from "../field-editors/ranking/RankingFieldEditor";
import { ZipCodeFieldEditor } from "../field-editors/zipCode/ZipCodeFieldEditor";
import { DropDownStaticFieldEditor } from "../field-editors/dropDownStatic/DropDownStaticFieldEditor.tsx";
import { CurrencyFieldEditor } from "../field-editors/currency/CurrencyFieldEditor";
import { PhoneNumberFieldEditor } from "../field-editors/phoneNumber/PhoneNumberFieldEditor";
import { AddressFieldEditor } from "../field-editors/address/AddressFieldEditor";
import { SignatureFieldEditor } from "../field-editors/signature/SignatureFieldEditor";
import { RatingFieldEditor } from "../field-editors/rating/RatingFieldEditor";
import { OpinionScaleFieldEditor } from "../field-editors/opinionScale/OpinionScaleFieldEditor";

// Field editor component props
export interface IFieldEditorProps {
	field: IColumn;
	cell: ICell | undefined;
	value: unknown;
	onChange: (newValue: unknown) => void;
	readonly?: boolean;
}

// Field editor component type
export type FieldEditorComponent = React.FC<IFieldEditorProps>;

/**
 * Get appropriate field editor component for a field type
 *
 * Uses separate form-style editors for expanded record view
 * These editors match grid editor UI but work in form context (no auto-open, no absolute positioning)
 *
 * @param fieldType - Field type
 * @returns Form-style editor component
 */
export const getFieldEditor = (fieldType: string): FieldEditorComponent => {
	switch (fieldType) {
		case CellType.Number:
			return NumberFieldEditor;

		case CellType.DateTime:
		case CellType.Time:
			return DateFieldEditor;

		case CellType.MCQ:
			return McqFieldEditor;

		case CellType.SCQ:
			return ScqFieldEditor;

		case CellType.DropDown:
			return DropDownStaticFieldEditor;

		case CellType.YesNo:
			return YesNoFieldEditor;

		case CellType.Ranking:
			return RankingFieldEditor;

		case CellType.ZipCode:
			return ZipCodeFieldEditor;

		case CellType.Currency:
			return CurrencyFieldEditor;

		case CellType.PhoneNumber:
			return PhoneNumberFieldEditor;

		case CellType.Address:
			return AddressFieldEditor;

		case CellType.Signature:
			return SignatureFieldEditor;

		case CellType.Rating:
			return RatingFieldEditor;

		case CellType.OpinionScale:
			return OpinionScaleFieldEditor;

		// TODO: Create dedicated form-style editors for FileUpload, Slider, List, etc.
		default:
			return StringFieldEditor;
	}
};
