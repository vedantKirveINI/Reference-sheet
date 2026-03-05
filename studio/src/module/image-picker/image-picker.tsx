import { CoreImagePicker } from "./components/coreImagePicker";
import { forwardRef } from "react";

export type ImagePickerProps = {
  onClose?: any;
  onChange?: any;
  isLoadingQuestionType?: boolean;
  variables?: any;
  workspaceId?: string;
  initialSearchQuery?: string;
  question?: any;
  val?: any;
  hideRecallButton?: boolean;
  hideEditButton?: boolean;
};

export const ImagePicker = forwardRef((props: ImagePickerProps, ref) => {
  const {
    onClose,
    onChange,
    isLoadingQuestionType,
    initialSearchQuery = "",
    variables,
    workspaceId,
    val,
    hideRecallButton,
    hideEditButton,
  } = props;
  return (
    <CoreImagePicker
      onClose={onClose}
      ref={ref}
      onChange={onChange}
      isLoadingQuestionType={isLoadingQuestionType}
      val={val}
      initialSearchQuery={initialSearchQuery}
      variables={variables}
      workspaceId={workspaceId}
      hideRecallButton={hideRecallButton}
      hideEditButton={hideEditButton}
    />
  );
});
