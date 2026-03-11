import type {
	ICell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { LoadingCell } from "./LoadingCell";

export const LoadingRenderer = {
	type: "Loading" as const,

	measure(cell: ICell, props: ICellMeasureProps): ICellMeasureResult {
		const { width, height } = props;
		return {
			width,
			height,
			totalHeight: height,
		};
	},

	draw(cell: ICell, props: ICellRenderProps) {
		const { ctx, rect, theme } = props;

		// Use LoadingCell to draw loading state
		LoadingCell.draw({
			ctx,
			rect,
			theme,
			shouldShowText: true,
			loadingText: "Loading...",
		});
	},
};
