import type { ICell, IColumn } from "@/types";
import { CellType } from "@/types";
import { ScqRenderer } from "./scq/ScqRenderer";
import { McqRenderer } from "./mcq/McqRenderer";
import { RatingRenderer } from "./rating/RatingRenderer";
import { NumberRenderer } from "./number/NumberRenderer";
import { CurrencyRenderer } from "./currency/CurrencyRenderer";
import { PhoneNumberRenderer } from "./phoneNumber/PhoneNumberRenderer";
import { ZipCodeRenderer } from "./zipCode/ZipCodeRenderer";
import { TimeRenderer } from "./time/TimeRenderer";
import { DateTimeRenderer } from "./dateTime/DateTimeRenderer";
import { CreatedTimeRenderer } from "./createdTime/CreatedTimeRenderer";
import { FileUploadRenderer } from "./fileUpload/FileUploadRenderer";
import { YesNoRenderer } from "./yesNo/YesNoRenderer";
import { DropDownRenderer } from "./dropDown/DropDownRenderer";
import { RankingRenderer } from "./ranking/RankingRenderer";
import { ListRenderer } from "./list/ListRenderer";
import { SignatureRenderer } from "./signature/SignatureRenderer";
import { OpinionScaleRenderer } from "./opinionScale/OpinionScaleRenderer";
import { StringRenderer } from "./string/StringRenderer";

// Renderer component type
export type CellRenderer = React.FC<{ cell: ICell; column: IColumn }>;

// Object-based mapping of cell types to renderers
export const cellRenderers: Record<string, CellRenderer> = {
	[CellType.SCQ]: ScqRenderer,
	[CellType.MCQ]: McqRenderer,
	[CellType.Rating]: RatingRenderer,
	[CellType.Number]: NumberRenderer,
	[CellType.Currency]: CurrencyRenderer,
	[CellType.PhoneNumber]: PhoneNumberRenderer,
	[CellType.ZipCode]: ZipCodeRenderer,
	[CellType.Time]: TimeRenderer,
	[CellType.DateTime]: DateTimeRenderer,
	[CellType.CreatedTime]: CreatedTimeRenderer,
	[CellType.FileUpload]: FileUploadRenderer,
	[CellType.YesNo]: YesNoRenderer,
	[CellType.DropDown]: DropDownRenderer,
	[CellType.Ranking]: RankingRenderer,
	[CellType.List]: ListRenderer,
	[CellType.Signature]: SignatureRenderer,
	[CellType.OpinionScale]: OpinionScaleRenderer,
	// Default renderer for String, LongText, Email, etc.
	[CellType.String]: StringRenderer,
};

// Get renderer for a cell type
export const getCellRenderer = (cellType: string): CellRenderer => {
	return cellRenderers[cellType] || StringRenderer;
};
