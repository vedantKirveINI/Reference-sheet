import React, { useEffect, useRef } from "react";
import { PublishStatus } from "../../../components/publish-status";

const RecipePublishLoader = React.memo(
  ({
    publishWorkflow,
    onClose,
    responseMappings,
    publishStatus,
    setPublishStatus,
  }) => {
    const ref = useRef(false);
    const publishForRecipe = async () => {
      if (responseMappings?.length) {
        if (!ref?.current) {
          ref.current = true;
          await publishWorkflow();
          onClose?.();
        }
      }
    };

    useEffect(() => {
      publishForRecipe();
    }, [responseMappings]);

    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 999999,
          backgroundColor: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <PublishStatus
          publishStatus={publishStatus}
          setPublishStatus={setPublishStatus}
        />
      </div>
    );
  },
);

export default RecipePublishLoader;
