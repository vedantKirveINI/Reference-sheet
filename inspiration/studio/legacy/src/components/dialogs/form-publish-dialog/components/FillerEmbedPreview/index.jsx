import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import classes from "./index.module.css";
import { debounce } from "lodash";

import { motion } from "framer-motion";
import { ViewPort } from "@oute/oute-ds.core.constants";
import FillerEmbedModeLayout from "../FillerEmbedModeLayout";
import {
  extractDomainFromUrl,
  getFillerEmbedModeLayoutProperties,
} from "../../../publish/utils";
import { useFormPublishContext } from "../../../publish/hooks/use-form-publish-context";

const FillerEmbedPreview = forwardRef(({ viewPort, mode }, ref) => {
  const { assetDetails, embedMode, embedSettings } = useFormPublishContext();
  const iframeRef = useRef(null);
  const doesInitialRenderComplete = useRef(false);

  // Immediate restart for user-triggered actions
  const immediateRestart = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.restart();
    }
  }, []);

  // Debounced restart for automatic state changes
  const debouncedRestart = useMemo(
    () =>
      debounce(
        () => {
          if (iframeRef.current) {
            iframeRef.current.restart();
          }
        },
        500, // 500ms delay
        { leading: false, trailing: true }, // Only execute the last call
      ),
    [],
  );

  const fillerEmbedModeLayoutProperties = useMemo(() => {
    // eslint-disable-next-line no-undef
    const domain = extractDomainFromUrl(process.env.REACT_APP_FORM_URL);
    return (
      getFillerEmbedModeLayoutProperties(
        embedMode,
        assetDetails?.asset?._id || "",
        domain,
        mode,
        embedSettings,
      )?.attributes || {}
    );
  }, [assetDetails?.asset?._id, embedSettings, embedMode, mode]);

  useImperativeHandle(
    ref,
    () => ({
      restart: immediateRestart,
    }),
    [immediateRestart],
  );

  // Debounced refresh  embedMode or embedSettings change
  useEffect(() => {
    if (!doesInitialRenderComplete.current) {
      doesInitialRenderComplete.current = true;
      return;
    }
    debouncedRestart();
  }, [embedMode, embedSettings, mode, debouncedRestart]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedRestart.cancel();
    };
  }, [debouncedRestart]);

  return (
    <>
      <div
        className={classes["preview-container"]}
        data-testid="filler-preview"
      >
        <motion.div
          className={classes["preview-content"]}
          initial={false}
          animate={{
            width: viewPort === ViewPort.DESKTOP ? "100%" : "45%",
            height: "100%",
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
          <FillerEmbedModeLayout
            ref={iframeRef}
            properties={fillerEmbedModeLayoutProperties}
            embedMode={embedMode}
            viewPort={viewPort}
          />
        </motion.div>
      </div>
    </>
  );
});

export default FillerEmbedPreview;
