import { useEffect, useState } from "react";
import RecipientDetails from "../../components/recipient-details/RecipientDetails";
import SenderDetails from "../../components/sender-details/SenderDetails";
// import { ODSLabel } from '@src/module/ods';
import { ODSLabel } from "@src/module/ods";
import classes from "../../AgentComposer.module.css";

const Configure = ({
  data,
  variables,
  onChange = () => {},
  setValidTabIndices,
  setError,
}) => {
  const [isExpanded, setIsExpanded] = useState("SENDER_DETAILS");

  useEffect(() => {
    if (!setValidTabIndices) return;
    // Validation rules
    const validationErrors = {
      companyName: !data?.companyName?.blocks?.length,
      businessContext: !data?.description?.blocks?.length,
      emailObjective: !data?.emailObjective?.blocks?.length,
      receipentDescription: !data?.recipientDescription?.blocks?.length,
      receipentEmail: !data?.recipientEmail?.blocks?.length,
    };

    const hasErrors = Object.values(validationErrors).some((error) => error);

    // Update valid tab indices
    setValidTabIndices((prev) => {
      if (!hasErrors) {
        if (!prev.includes(1)) {
          return [...prev, 1];
        }
        return prev;
      } else {
        return prev.filter((index) => index !== 1);
      }
    });

    // // Update error messages
    setError((prev) => {
      const errorMessages = [];

      if (validationErrors.companyName) {
        errorMessages.push("Sender's Company Name is required");
      }

      if (validationErrors.emailObjective) {
        errorMessages.push("Email Objective is required");
      }

      if (validationErrors.businessContext) {
        errorMessages.push("Business Context is required");
      }

      if (validationErrors.receipentEmail) {
        errorMessages.push("Recipient Email is required");
      }

      if (validationErrors.receipentDescription) {
        errorMessages.push("Recipient Context is required");
      }

      return {
        ...prev,
        1: errorMessages,
      };
    });
  }, [setValidTabIndices, setError, data]);
  return (
    <div className={classes["configure-container"]}>
      <div style={{ padding: "1.25rem 1.5rem" }}>
        <ODSLabel variant="body2" color="#607D8B">
          Crafts hyper-personalized emails using deep prospect insights to
          create compelling, tailored messages that resonate with each
          recipient.
        </ODSLabel>
      </div>
      <div>
        <SenderDetails
          variables={variables}
          data={data}
          onChange={onChange}
          isExpanded={isExpanded}
          toggleExpanded={() => {
            setIsExpanded((prev) =>
              prev === "SENDER_DETAILS" ? "" : "SENDER_DETAILS"
            );
          }}
        />
      </div>
      <div>
        <RecipientDetails
          isExpanded={isExpanded}
          variables={variables}
          data={data}
          onChange={onChange}
          toggleExpanded={() => {
            setIsExpanded((prev) =>
              prev === "RECIPIENT_DETAILS" ? "" : "RECIPIENT_DETAILS"
            );
          }}
        />
      </div>
    </div>
  );
};

export default Configure;
