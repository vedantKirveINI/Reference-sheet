import React, { useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { icons } from "@/components/icons";
import { validateFormResponsesMapping } from "../../../../../utils/formResponses";

const ErrorMessage = ({ mappings, questions, dataTestId }) => {
  const hasErrors = useMemo(() => {
    return validateFormResponsesMapping({ mappings, questions });
  }, [mappings, questions]);

  if (!hasErrors) return null;

  return (
    <Alert variant="destructive" data-testid={dataTestId}>
      {icons.alertCircle && (
        <icons.alertCircle className="h-4 w-4" />
      )}
      <AlertDescription>There are some errors in mapping.</AlertDescription>
    </Alert>
  );
};

export default ErrorMessage;
