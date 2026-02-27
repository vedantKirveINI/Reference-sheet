// Type declaration for oute-ds-popper
declare module "oute-ds-popper" {
	import { ReactNode } from "react";
	import { SxProps, Theme } from "@mui/material/styles";

	interface PopperModifier {
		name: string;
		options?: Record<string, any>;
	}

	interface ODSPopperProps {
		open: boolean;
		anchorEl: HTMLElement | null;
		placement?:
			| "top"
			| "bottom"
			| "left"
			| "right"
			| "top-start"
			| "top-end"
			| "bottom-start"
			| "bottom-end"
			| "left-start"
			| "left-end"
			| "right-start"
			| "right-end";
		disablePortal?: boolean;
		modifiers?: PopperModifier[];
		sx?: SxProps<Theme>;
		children: ReactNode;
		className?: string;
	}

	const ODSPopper: React.FC<ODSPopperProps>;
	export default ODSPopper;
}
