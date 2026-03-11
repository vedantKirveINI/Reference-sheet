import { forwardRef, lazy, Suspense } from "react";
import { getMode } from "../../canvas/config";
import { CANVAS_MODES } from "../../../module/constants";

const LazyFormPublish = lazy(() => import("./forms"));
const LazyCommonPublish = lazy(() => import("./common-publish"));
const LazyWorkflowPublish = lazy(() => import("./workflow"));

const PublishPopper = forwardRef(
  (
    {
      userData = {},
      initialAssetDetails,
      nodes = [],
      getSavePayload = () => {},
      onPublishSuccess = () => {},
      onClose = () => {},
      onAnalyticsEvent = () => {},
      onAssetDetailsChange,
    },
    ref
  ) => {
    const mode = getMode();

    const getComponentForMode = () => {
      switch (mode) {
        case CANVAS_MODES.WORKFLOW_CANVAS:
          return LazyFormPublish;
        case CANVAS_MODES.WC_CANVAS:
          return LazyWorkflowPublish;
        case CANVAS_MODES.INTEGRATION_CANVAS:
        case CANVAS_MODES.AGENT_CANVAS:
        case CANVAS_MODES.CMS_CANVAS:
        case CANVAS_MODES.TOOL_CANVAS:
          return LazyCommonPublish;
        default:
          throw new Error(`Unsupported mode: ${mode}`);
      }
    };

    const Component = getComponentForMode();

    return (
      <Suspense fallback={<div>Loading Publish Panel...</div>}>
        <Component
          ref={ref}
          userData={userData}
          initialAssetDetails={initialAssetDetails}
          nodes={nodes}
          getSavePayload={getSavePayload}
          onPublishSuccess={onPublishSuccess}
          onClose={onClose}
          onAnalyticsEvent={onAnalyticsEvent}
          onAssetDetailsChange={onAssetDetailsChange}
        />
      </Suspense>
    );
  }
);

export default PublishPopper;
