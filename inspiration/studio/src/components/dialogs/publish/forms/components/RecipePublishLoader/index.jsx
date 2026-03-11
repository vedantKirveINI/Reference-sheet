import React, { useEffect, useRef } from "react";
import { PublishStatus } from "../../../components/publish-status";

const RecipePublishLoader = React.memo(
  ({
    publishWorkflow,
    onClose,
    responseMappings,
    publishStatus,
    setPublishStatus,
    publishStep = null,
    assetType = null,
  }) => {
    const ref = useRef(false);
    const publishForRecipe = async () => {
      if (responseMappings?.length) {
        if (!ref?.current) {
          ref.current = true;
          await publishWorkflow();
        }
      }
    };

    useEffect(() => {
      publishForRecipe();
    }, [responseMappings]);

    return (
      <div className="absolute inset-0 z-[999999] bg-white flex items-center justify-center">
        <PublishStatus
          publishStatus={publishStatus}
          setPublishStatus={setPublishStatus}
          closeHandler={onClose}
          publishStep={publishStep}
          assetType={assetType}
        />
      </div>
    );
  },
);

export default RecipePublishLoader;
