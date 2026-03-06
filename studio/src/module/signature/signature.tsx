import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import SignatureCanvas from "react-signature-canvas";
import { styles } from "./styles";
import { uploadSignature } from "./utils/fileUploadApi";
import { convertToBase64 } from "./utils/convertToBase64";
export type SignatureProps = {
  isCreator?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  question?: {
    settings?: {
      penColor?: string;
      backgroundColor?: string;
    };
  };
  theme?: any;
  error?: string;
};

export const Signature = forwardRef(
  (
    {
      isCreator,
      value,
      onChange = () => {},
      question,
      theme,
      error,
    }: SignatureProps,
    ref
  ) => {
    const signatureRef = useRef<SignatureCanvas>(null);
    const penColor = question?.settings?.penColor || "#000000";
    const backgroundColor = question?.settings?.backgroundColor || "#ffffff";

    useEffect(() => {
      if (isCreator) {
        signatureRef.current?.off();
      }
    }, [isCreator]);

    // "" || undefined || null || base64 || url
    useEffect(() => {
      if (!value) {
        signatureRef.current?.clear();
        return;
      }
      const loadSignature = async () => {
        try {
          const dataURL = value.startsWith("data:image")
            ? value
            : await convertToBase64(value);
          signatureRef.current?.fromDataURL(dataURL);
        } catch (err) {
        }
      };

      loadSignature();
    }, []);

    const clearSignature = () => {
      signatureRef.current?.clear();
      signatureRef.current?.fromData([]);
      onChange("");
    };

    const handleChange = () => {
      const signatureImage = signatureRef.current?.toDataURL();
      if (signatureImage) {
        onChange(signatureImage);
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        async uploadSignature() {
          if (value.startsWith("data:image")) {
            const signatureImage = signatureRef.current?.toDataURL();
            if (signatureImage) {
              return uploadSignature(signatureImage);
            }
          } else {
            return value;
          }
        },
        isEmpty: () => signatureRef.current?.isEmpty(),
        validateSignature() {
          if (
            !value.startsWith("data:image") &&
            !signatureRef.current?.isEmpty()
          ) {
            return true;
          }
          const points = signatureRef.current?.toData() ?? [];
          return points.some((stroke) => stroke.length > 1);
        },
      }),
      [value]
    );

    return (
      <div
        style={styles.container(backgroundColor, error)}
        data-testid="signature-container"
      >
        <SignatureCanvas
          penColor={penColor}
          maxWidth={1}
          dotSize={0}
          ref={signatureRef}
          canvasProps={{
            style: styles.canvas(),
            "data-testid": "signature-canvas",
          }}
          onEnd={handleChange}
        />
        <span
          onClick={clearSignature}
          style={styles.clearBtn({ theme, isCreator })}
          data-testid="signature-clear"
        >
          Clear Signature
        </span>
      </div>
    );
  }
);
