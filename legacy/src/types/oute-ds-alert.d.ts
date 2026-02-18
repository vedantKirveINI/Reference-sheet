declare module "oute-ds-alert" {
	export interface AlertOptions {
		type: "success" | "error" | "warning" | "info";
		message: string;
		duration?: number;
	}

	export function showAlert(options: AlertOptions): void;

	const defaultExport: {
		showAlert: typeof showAlert;
	};

	export default defaultExport;
}
