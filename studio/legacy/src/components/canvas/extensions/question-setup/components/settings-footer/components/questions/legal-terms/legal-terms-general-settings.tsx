/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import React from "react";
import { styles } from "./styles";
import CTAEditor from "../../common-settings/cta-editor";

interface LegalTermsSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  variables?: any;
}

const LegalTermsSettings = ({
  question,
  onChange,
  variables = {},
}: LegalTermsSettingsProps) => {
  return (
    <div css={styles.container} data-testid="legal-terms-general-settings">
      <div css={styles.wrapperContainer}>
        <CTAEditor />
      </div>
    </div>
  );
};

export default LegalTermsSettings;
