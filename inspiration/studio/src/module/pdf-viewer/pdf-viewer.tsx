import { forwardRef, useEffect, useState } from "react";
import { FormulaBar } from "@src/module/ods";
import { styles } from "./styles";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";
import { ODSError as Error } from "@src/module/ods";
import { ViewPort } from "@oute/oute-ds.core.constants";

export type PdfViewerProps = {
  isCreator?: boolean;
  value?: any;
  onChange?: any;
  question?: any;
  theme?: any;
  variables?: any;
  answers?: any;
  viewPort?: ViewPort;
  placeholder?: string;
};

export const PdfViewer = forwardRef(
  (
    {
      isCreator,
      value,
      onChange = () => {},
      question = {},
      theme = {},
      variables,
      answers,
      placeholder,
      viewPort,
    }: PdfViewerProps,
    ref
  ) => {
    const [url, setUrl] = useState("");
    const [error, setError] = useState(null);
    const showToolbar = question?.settings?.showToolbar ?? true;

    const handleOnChange = (urlData) => {
      onChange(urlData);
    };

    function checkIfUrlValid(url) {
      try {
        const parsed = new URL(url);
        return (
          ["http:", "https:"].includes(parsed.protocol) &&
          parsed.pathname.toLowerCase().endsWith(".pdf")
        );
      } catch {
        return false;
      }
    }

    const resolveFx = async () => {
      try {
        const res = await OuteServicesFlowUtility?.resolveValue(
          answers,
          "",
          value,
          null
        );
        return res?.value;
      } catch (error) {
        console.log(answers, value, "Invalid Fx value");
      }
    };

    const getPdfUrl = async () => {
      const resolvedUrl = await resolveFx();
      const isUrlValid = checkIfUrlValid(resolvedUrl);
      if (!isUrlValid) {
        setError(true);
      } else {
        setError(false);
        setUrl(resolvedUrl);
      }
    };

    useEffect(() => {
      getPdfUrl();
    }, []);

    return (
      <div data-testid="pdf-viewer">
        {isCreator ? (
          <FormulaBar
            isReadOnly={false}
            hideInputBorders={false}
            defaultInputContent={value?.blocks || []}
            onInputContentChanged={(content) => {
              handleOnChange({ type: "fx", blocks: content });
            }}
            slotProps={{
              container: { style: { backgroundColor: "white" } },
            }}
            placeholder={placeholder || "Please add PDF URL"}
            wrapContent={false}
            style={{ ...styles.getInputStyles(), padding: 0 }}
            variables={variables}
            data-testid="pdf-viewer-formula-bar"
          />
        ) : (
          <>
            {error ? (
              <div
                style={styles.getErrorContainerStyles()}
                data-testid="pdf-viewer-error"
              >
                <img
                  src="https://ccc.oute.app/test/1738046938286/invalid_url_image.webp"
                  alt="Invalid URL"
                  style={styles.getImageStyles()}
                />
                <div style={styles.getErrorStyles()}>
                  <Error
                    text="Invalid URL"
                    animate={false}
                    style={{ padding: 0 }}
                  />
                  <span
                    style={styles.getErrorTextStyle()}
                    data-testid="pdf-error-text"
                  >
                    The link to the PDF is either broken or does not exist.
                  </span>
                </div>
              </div>
            ) : (
              <embed
                id="pdfViewer"
                type="application/pdf"
                src={url + `${showToolbar ? "" : "#toolbar=0&navpanes=0"}`}
                style={{
                  width: "100%",
                  height:
                    viewPort === ViewPort.MOBILE ? "37.6875em" : "39.3125em",
                }}
                data-testid="pdf-viewer-embed"
              />
            )}
          </>
        )}
      </div>
    );
  }
);
