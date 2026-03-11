import { useEffect } from "react";

const Redirect = (props) => {
	const { url } = props;
	useEffect(() => {
		window.location.href = url;
	}, [url]);

	return <div style={{ padding: "0.3125rem" }}>Redirecting...</div>;
};

export default Redirect;
