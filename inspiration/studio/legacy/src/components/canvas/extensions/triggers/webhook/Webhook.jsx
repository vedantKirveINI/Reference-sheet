import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect,
} from "react";

// import { showAlert } from "oute-ds-alert";
import { showAlert } from "@src/module/ods";

import Configure from "./configure/Configure";
import hookNRunServices from "../../../services/hookAndRunServices";
import { convertJsonToGridSchema } from "@oute/oute-ds.molecule.input-grid-v2/components";

const Webhook = forwardRef(({ data, assetId }, ref) => {
  const POLLING_TIMEOUT = 30000;
  const POLLING_INTERVAL = 5000;
  const [webhookName, setWebhookName] = useState(data?.label || "My webhook");
  const [ipRestrictions, setIPRestrictions] = useState(data?.allowed_ips);
  const [webhookData, setWebhookData] = useState(data?.webhookData || {});
  const [inputs, setInputs] = useState(data?.inputs || []);

  const [polling, setPolling] = useState(false);
  const [pollIntervalId, setPollIntervalId] = useState();
  const [pollTimeoutId, setPollTimeoutId] = useState();

  const pollUntilDataStructureIsReceived = useCallback(
    (uuid) => {
      setPolling(true);
      const start = new Date();
      return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const response = await hookNRunServices.getQueueByStart({
              start,
              "meta.uuid": uuid,
            });
            if (response.status === "success" && response.result?.length > 0) {
              clearInterval(interval);
              clearTimeout(pollTimeoutId);
              setPolling(false);
              resolve(response.result[0]);
            }
          } catch (error) {
            clearInterval(interval);
            clearTimeout(pollTimeoutId);
            setPolling(false);
            reject(error);
          }
        }, POLLING_INTERVAL);
        setPollIntervalId(interval);

        const timeoutId = setTimeout(() => {
          clearInterval(interval);
          setPolling(false);
          reject(
            new Error(
              `Timeout: No response received within ${POLLING_TIMEOUT / 1000} seconds`
            )
          );
        }, POLLING_TIMEOUT);
        setPollTimeoutId(timeoutId);
      });
    },
    [pollTimeoutId]
  );

  const beginPolling = useCallback(
    (uuid) => {
      pollUntilDataStructureIsReceived(uuid)
        .then((response) => {
          setInputs(
            convertJsonToGridSchema({ "": { ...(response?.details || {}) } }) ||
              []
          );
        })
        .catch((error) => {
          showAlert({
            type: "error",
            message: error.message,
          });
        });
    },
    [pollUntilDataStructureIsReceived]
  );

  const createWH = useCallback(
    async (allowed_ips) => {
      const ip = allowed_ips;
      const response = await hookNRunServices.generateWebhookUrl({
        watch_enabled: true, //send true if want to execute the flows
        // identifier: "asd", //mandate
        published_asset_id: assetId, //mandate
        event_src: "CUSTOM", //mandate
        event_type: "CUSTOM_WATCHER", //mandate
        name: webhookName,
        allowed_ips: ip,
      });
      if (response.status === "success") {
        setWebhookData(response.result);
        beginPolling(response.result.uuid);
      }
    },
    [assetId, beginPolling, webhookName]
  );

  useImperativeHandle(
    ref,
    () => ({
      getData: () => {
        return {
          label: webhookName,
          allowed_ips: ipRestrictions,
          webhookData,
          inputs,
        };
      },
    }),
    [inputs, ipRestrictions, webhookData, webhookName]
  );

  useEffect(() => {
    return () => {
      clearInterval(pollIntervalId);
      clearTimeout(pollTimeoutId);
    };
  }, [pollIntervalId, pollTimeoutId]);

  return (
    <Configure
      setWebhookName={setWebhookName}
      webhookName={webhookName}
      setInputs={setInputs}
      inputs={inputs}
      setIPRestrictions={setIPRestrictions}
      ipRestrictions={ipRestrictions}
      webhookData={webhookData}
      setPolling={setPolling}
      polling={polling}
      pollIntervalId={pollIntervalId}
      pollTimeoutId={pollTimeoutId}
      beginPolling={beginPolling}
      createWH={createWH}
    />
  );
});

export default Webhook;
