import React, { lazy, Suspense } from "react";
import { LazyMotion, m, AnimatePresence } from "framer-motion";
import styles from "../terminal.module.css";
import { canJsonViewerRender, getLogTypeColor } from "../utils";

import "../styles/react-json-view.css";

const ReactJson = lazy(() => import("react-json-view"));

const loadFeatures = () =>
  import("../utils/framer-dom-animation-features").then(
    (res) => res.domAnimation
  );

export interface LogContentProps {
  log: Record<string, any>;
  index: number;
  isVerbose: boolean;
}

export const LogContent: React.FC<LogContentProps> = ({
  log,
  index,
  isVerbose,
}) => {
  const colorClass = getLogTypeColor(log.type);

  return (
    <LazyMotion features={loadFeatures}>
      <m.div
        key={index}
        className={styles.logItem}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div
          className={`${styles.line}`}
          style={{ backgroundColor: colorClass }}
        ></div>

        <div className={styles.logContent}>
          <div className={styles.logMessageContainer}>
            <div className={styles.timestamp}>{log.timestamp}</div>
            <div className={styles.logMessage}>
              <div className={styles.logEventName}>{log.logEventName} : </div>
              <div className={styles.logMessage}>{log.message}</div>
            </div>
          </div>
          {log.executionTime && (
            <div className={styles.executionTime}>{log.executionTime}</div>
          )}
        </div>

        <AnimatePresence>
          {log.data && isVerbose && (
            <m.div
              className={styles.verboseContent}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Suspense
                fallback={
                  <div className="json-loading">Loading JSON viewer...</div>
                }
              >
                {canJsonViewerRender(log?.data) ? (
                  <ReactJson
                    src={log?.data}
                    enableClipboard={(copy) =>
                      navigator.clipboard.writeText(
                        typeof copy === "object" && copy?.src
                          ? JSON.stringify(copy.src, null, 2)
                          : String(copy || "")
                      )
                    }
                    indentWidth={2}
                    iconStyle="square"
                    theme="rjv-default"
                    quotesOnKeys={false}
                    collapseStringsAfterLength={50}
                    displayDataTypes={false}
                    displayObjectSize={false}
                    collapsed={1}
                    name={false}
                    style={{
                      fontSize: "0.9rem",
                      fontFamily: "Inter, monospace",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      fontSize: "0.9rem",
                      fontFamily: "Inter, monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {log.data}
                  </div>
                )}
              </Suspense>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </LazyMotion>
  );
};
