import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthRoute from "../../components/AuthRoute";
import Redirect from "../redirect";
// import { serverConfig } from "oute-ds-utils";
import { serverConfig } from "@src/module/ods";
import { useEffect } from "react";
import {
  // getFavIcon,
  getCanvasMetaData,
  // updateFavIcon,
  updateTitle,
} from "../../utils/utils";
import { getMode } from "../../config/config";
import { Suspense } from "react";
import AssetNotFound from "../asset-not-found";
import PageProcessingLoader from "../../components/loaders/PageProcessingLoader";
import { useAuth } from "@oute/oute-ds.common.molecule.tiny-auth";

// import IC from "../ic-canvas";
const IC = React.lazy(() => import("../ic-canvas"));
// const AssetNotFound = React.lazy(() => import("../asset-not-found"));

const Landing = () => {
  const { user } = useAuth();

  useEffect(() => {
    updateTitle(getCanvasMetaData(getMode()));
    // updateFavIcon(getFavIcon(getMode()));
  }, []);


  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthRoute
            component={(...args) => (
              <Suspense
                fallback={
                  <PageProcessingLoader
                    height="12rem"
                    style={{
                      position: "unset",
                      boxShadow: "none",
                      background: "none",
                    }}
                    showLogo={true}
                  />
                }
              >
                <IC {...args} />
              </Suspense>
            )}
          />
        }
      />
      <Route
        path="resource-not-found"
        element={<AssetNotFound />}
        // element={
        //   <AuthRoute
        //     component={(...args) => (
        //       <Suspense fallback={null}>
        //         <AssetNotFound {...args} />
        //       </Suspense>
        //     )}
        //   />
        // }
      />
      <Route
        path="*"
        element={<Redirect url={process.env.REACT_APP_WC_LANDING_URL} />}
      />
    </Routes>
  );
};

export default Landing;
