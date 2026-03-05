import { forwardRef } from "react";
import CopyableTextField from "../../../components/copyable-text-field";
import { getSheetURL } from "../../utils";
import {
  UATU_CANVAS,
  UATU_PREDICATE_EVENTS_CANVAS,
} from "@oute/oute-ds.common.core.utils";
import ResponseMappingTable from "./response-mapping/components/response-mapping-table";
import UnmappedQuestions from "./response-mapping/components/unmapped-questions";
import ErrorMessage from "./response-mapping/components/error-message";

const FormResponsesTab = ({
  assetDetails,
  responseMappings = [],
  setResponseMappings,
  onMappingsChange,
  onAnalyticsEvent,
  questions,
}) => {
  return (
    <div className="space-y-6">
      <CopyableTextField
        title="Responses Sheet Link"
        value={
          !!assetDetails?.asset?.published_info
            ? getSheetURL({ assetDetails })
            : "Publish form to get the sheet link."
        }
        isEnabled={!!assetDetails?.asset?.published_info}
        onCopy={(url) => {
          onAnalyticsEvent?.(UATU_CANVAS, {
            subEvent: UATU_PREDICATE_EVENTS_CANVAS.COPY_SHEET_URL,
            url,
          });
        }}
      />

      <div className="space-y-4">
        <ResponseMappingTable
          questions={questions}
          mappings={responseMappings}
          onChange={(mappings) => {
            setResponseMappings(mappings);
            onMappingsChange(mappings);
          }}
          dataTestId={`form-response-mapping-table`}
        />
        
        <ErrorMessage
          mappings={responseMappings}
          questions={questions}
          dataTestId="form-response-mapping-errors"
        />
      </div>

      <UnmappedQuestions
        questions={questions}
        mappedQuestions={responseMappings}
        dataTestId="form-response-mapping-unmapped"
      />
    </div>
  );
};

export default FormResponsesTab;
