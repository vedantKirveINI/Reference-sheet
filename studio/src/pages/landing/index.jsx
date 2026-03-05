import React, { useEffect, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AuthRoute from "../../components/AuthRoute";
import Redirect from "../redirect";
import {
  getCanvasMetaData,
  updateTitle,
} from "../../utils/utils";
import { getMode } from "../../config/config";
import AssetNotFound from "../asset-not-found";
import WorkflowCanvasLoader from "../../components/loaders/WorkflowCanvasLoader";
import SequenceCanvasLoader from "../../components/loaders/SequenceCanvasLoader";
import TabsComponent from "../tabs-component";
import { ConnectionManagerDemo } from "@/components/connection-manager/ConnectionManagerDemo";

const IC = React.lazy(() => import("../ic-canvas"));
const Sequence = React.lazy(() => import("../sequence"));

const Landing = () => {
  useEffect(() => {
    updateTitle(getCanvasMetaData(getMode()));
  }, []);

  const ICComponent = (
    <AuthRoute
      component={(...args) => (
        <Suspense
          fallback={<WorkflowCanvasLoader />}
        >
          <IC {...args} />
        </Suspense>
      )}
    />
  );

  const SequenceComponent = (
    <Suspense
      fallback={<SequenceCanvasLoader />}
    >
      <Sequence />
    </Suspense>
  );

  return (
    <Routes>
      <Route
        path="/"
        element={ICComponent}
      />
      <Route
        path="/sequence"
        element={SequenceComponent}
      />
      <Route
        path="/ic-canvas"
        element={ICComponent}
      />
      <Route
        path="/temp-studio"
        element={ICComponent}
      />
      <Route
        path="/tabs"
        element={<TabsComponent />}
      />
      <Route
        path="/connection-manager"
        element={<ConnectionManagerDemo />}
      />
      <Route
        path="resource-not-found"
        element={<AssetNotFound />}
      />
      <Route
        path="*"
        element={<Redirect url={process.env.REACT_APP_WC_LANDING_URL} />}
      />
    </Routes>
  );
};

export default Landing;
