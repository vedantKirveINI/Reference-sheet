import React, { useEffect } from "react";

const Redirect = (props) => {
  const { url } = props;
  useEffect(() => {
    window.location.href = url;
  }, [url]);

  return <div style={{ padding: "5px" }}>Redirecting...</div>;
};

export default Redirect;
