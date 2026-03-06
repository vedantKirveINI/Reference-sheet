import { Suspense } from "react";

const SuspenseComponent = ({ children }) => {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
};

export default SuspenseComponent;
