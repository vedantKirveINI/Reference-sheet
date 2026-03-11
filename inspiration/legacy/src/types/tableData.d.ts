import { IColumn, IRecord, IRowHeader } from "./index";

export interface IFormattedTableData {
	columns: Array<IColumn & { rawType?: string; rawOptions?: any }>;
	records: IRecord[];
	rowHeaders: IRowHeader[];
}
