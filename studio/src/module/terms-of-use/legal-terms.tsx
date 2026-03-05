import React, { useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import styles from "./legal-terms.module.css";

export type LegalTermsProps = {
  onChange?: (key?: any, value?: any) => void;
  isCreator?: boolean;
  theme?: any;
  question?: any;
  value?: any;
  dataTestId?: string;
};

export function LegalTerms({
  isCreator,
  theme,
  question,
  value,
  onChange = () => {},
  dataTestId,
}: LegalTermsProps) {
  // Get content from question.termsContent or question.value
  const termsContent = question?.termsContent || question?.value || "";

  const handleContentChange = useCallback(
    (newContent: string) => {
      if (isCreator) {
        onChange("termsContent", newContent);
      }
    },
    [isCreator, onChange]
  );

  const handleAgreementChange = useCallback(
    (agreed: boolean) => {
      if (!isCreator) {
        onChange(agreed ? "Yes" : "No");
      }
    },
    [isCreator, onChange]
  );

  const isAgreed = isCreator ? false : value === "Yes";

  const fontFamily = theme?.styles?.fontFamily || "inherit";

  // Setting the default value
  useEffect(() => {
    if (termsContent && !isCreator && (value === null || value === undefined)) {
      onChange("No");
    }
  }, []);

  if (isCreator) {
    return (
      <div className={styles.container} data-testid={dataTestId}>
        <div className={styles.editorWrapperContainer}>
          <div className={styles.editorContainer}>
            <textarea
              className={styles.textarea}
              value={termsContent}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Enter terms and conditions in Markdown format... You can paste markdown text here."
              data-testid={`${dataTestId}-editor`}
              style={{ fontFamily: fontFamily }}
            />
          </div>
          <div
            className={styles.stickyConsentFooter}
            style={{ fontFamily: fontFamily }}
          >
            <div className="flex items-center gap-2">
              <Checkbox
                id={`${dataTestId}-consent-checkbox`}
                checked={isAgreed}
                disabled
                data-testid={`${dataTestId}-consent-checkbox`}
                className={cn(
                  "h-5 w-5 rounded border-2 border-neutral-300",
                  "data-[state=checked]:bg-neutral-900 data-[state=checked]:text-white data-[state=checked]:border-neutral-900"
                )}
              />
              <Label
                htmlFor={`${dataTestId}-consent-checkbox`}
                className="cursor-default select-none text-base leading-snug text-neutral-800"
                style={{ fontFamily: fontFamily }}
              >
                I have read and agree to the terms
              </Label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} data-testid={dataTestId}>
      <div className={styles.markdownContainer} style={{ fontFamily: fontFamily }}>
        <div
          className={styles.markdownContent}
          style={{ 
            fontFamily: fontFamily,
            paddingBottom: termsContent ? "1em" : "0"
          }}
        >
          {termsContent ? (
            <ReactMarkdown>{termsContent}</ReactMarkdown>
          ) : (
            <div className={styles.creatorPlaceholder}>
              No terms content available
            </div>
          )}
        </div>
        <div
          className={styles.stickyConsentFooter}
          style={{ fontFamily: fontFamily }}
        >
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${dataTestId}-consent-checkbox`}
              checked={isAgreed}
              onCheckedChange={(checked) => handleAgreementChange(checked === true)}
              data-testid={`${dataTestId}-consent-checkbox`}
              className={cn(
                "h-5 w-5 rounded border-2 border-neutral-300",
                "data-[state=checked]:bg-neutral-900 data-[state=checked]:text-white data-[state=checked]:border-neutral-900"
              )}
            />
            <Label
              htmlFor={`${dataTestId}-consent-checkbox`}
              className="cursor-pointer select-none text-base leading-snug text-neutral-800"
              style={{ fontFamily: fontFamily }}
            >
              I have read and agree to the terms
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
