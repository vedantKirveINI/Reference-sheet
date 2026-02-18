// Minimal ambient declarations for OUTE DS packages to satisfy TypeScript
declare module "oute-ds-popover";
declare module "oute-ds-icon";
declare module "oute-ds-tooltip";
declare module "oute-ds-text-field";
declare module "oute-ds-button";
declare module "oute-ds-label";
declare module "oute-ds-dialog";
declare module "oute-ds-radio";
declare module "oute-ds-autocomplete";
declare module "oute-ds-switch";
declare module "oute-ds-radio-group";
declare module "oute-ds-loading-button";
declare module "@/constants/yesNoOptions" {
	interface IYesNoOption {
		label: string;
		value: string;
	}
	const YES_NO_OPTIONS: IYesNoOption[];
	export default YES_NO_OPTIONS;
}
