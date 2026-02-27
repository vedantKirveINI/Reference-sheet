import { ReactAppOptions } from "@teambit/react";

export const IcStudioApp: ReactAppOptions = {
	name: "sheets",
	entry: [require.resolve("./sheets.app-root")],
};

export default IcStudioApp;
