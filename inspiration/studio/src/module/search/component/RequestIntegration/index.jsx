import React from "react";
// import { ODSIcon as Icon } from '@src/module/ods';
import { ODSIcon as Icon } from "../../../ods";
import { useAuth } from "@oute/oute-ds.common.molecule.tiny-auth";

import styles from "./styles.module.css";

function RequestIntegration({ reqIntegration }) {
  const { user } = useAuth();

  return (
    <div
      className={`${styles.container} ${styles[reqIntegration]}`}
      role="alert"
      aria-live="polite"
    >
      <Icon
        outeIconName="OUTESearchIcon"
        outeIconProps={{
          sx: { color: "#1976d2", width: "1.75rem", height: "1.75rem" },
        }}
      />
      <div className={styles.text}>
        Not seeing your integration?{" "}
        <a
          href={`${process.env.REACT_APP_REQ_INTEGRATION_FORM_URL}/?name=${user?.name}&userId=${user?.sub}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          <b>Let us know here</b>
        </a>{" "}
        — we'll make it happen!
      </div>
    </div>
  );
}

export default RequestIntegration;
