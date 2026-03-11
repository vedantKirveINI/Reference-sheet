import { useEffect } from "react";

const usePageTitle = (pageTitle) => {
	useEffect(() => {
		const prevTitle = document.title;
		document.title = pageTitle || "Untitled Sheet";

		return () => {
			document.title = prevTitle;
		};
	}, [pageTitle]);
};

export { usePageTitle };
