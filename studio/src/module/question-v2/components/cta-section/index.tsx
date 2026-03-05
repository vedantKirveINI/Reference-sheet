import { CSSProperties, forwardRef, useCallback, useState } from "react";
import { domAnimation } from "../../shared/lib";
import { styles } from "./styles";
import { PressEnterGuide } from "../question-guides/press-enter-guide";

import { LazyMotion, m, AnimatePresence } from "framer-motion";

import { ODSInfoCard as InfoCard } from "@src/module/ods";
import { CircularLoader } from "../circular-loader/circular-loader";
import { DEFAULT_QUESTION_CONFIG } from "@oute/oute-ds.core.constants";

export interface CtaSectionProps {
  editable: boolean;
  content: string;
  theme: any;
  questionData: any;
  onClick?: (...args: any[]) => void;
  loading?: boolean;
  style?: CSSProperties;
}

export const CTASection = forwardRef<HTMLButtonElement, CtaSectionProps>(
  (
    {
      theme = {},
      questionData,
      content,
      editable,
      onClick = () => {},
      loading = false,
    },
    ref
  ) => {
    const [showHelper, setShowHelper] = useState<boolean>(false);

    const executeFunction = useCallback(() => {
      if (onClick && typeof onClick === "function") {
        onClick({
          ref,
        });
      }
    }, [onClick, ref]);

    return (
      <LazyMotion features={domAnimation}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems:
              questionData?.settings?.questionAlignment || "flex-start",
          }}
        >
          <div style={styles.containerStyle} data-testid="fds-normal-button">
            <m.div
              style={styles.buttonContainerStyles({
                theme,
                showHover: !editable,
                loading,
              })}
              data-testid="question-cta-button"
              onClick={() => {
                if (!editable) {
                  executeFunction();
                } else {
                  setShowHelper(true);
                }
              }}
              role="button"
              initial={{ opacity: 1 }}
              animate={{
                opacity: loading ? 0.6 : 1,
                scale: loading ? 0.95 : 1,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {loading && (
                <m.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <CircularLoader />
                </m.div>
              )}
              <m.button
                style={styles.buttonStyles}
                dangerouslySetInnerHTML={{
                  __html:
                    content ||
                    DEFAULT_QUESTION_CONFIG[questionData?.type]?.buttonLabel || 'Submit',
                }}
                ref={ref}
                disabled={loading}
                animate={{ opacity: loading ? 0.5 : 1 }}
                transition={{ duration: 0.3 }}
              />
            </m.div>
            <PressEnterGuide
              isCreator={editable}
              theme={theme}
              questionType={questionData?.type}
            />
          </div>
          <AnimatePresence>
            {editable && showHelper && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <InfoCard
                  helperText={
                    <div data-testid="cta-helper-text">
                      Button is clickable in preview mode and when form is
                      filled. Although you can{" "}
                      <span
                        style={styles.editableText}
                        onClick={() => {
                          executeFunction();
                          setShowHelper(false);
                        }}
                        data-testid="cta-helper-action-text"
                      >
                        Edit button text
                      </span>{" "}
                      in settings.
                    </div>
                  }
                  style={{
                    marginTop: "0.69em",
                    alignSelf: questionData?.settings?.questionAlignment,
                  }}
                  onClickAway={() => setShowHelper(false)}
                />
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </LazyMotion>
    );
  }
);
