import { useEffect } from "react";

interface RedirectProps {
	url: string;
}

const Redirect = ({ url }: RedirectProps) => {
	useEffect(() => {
		window.location.href = url;
	}, [url]);

	return <div style={{ padding: "0.3125rem" }}>Redirecting...</div>;
};

export default Redirect;
