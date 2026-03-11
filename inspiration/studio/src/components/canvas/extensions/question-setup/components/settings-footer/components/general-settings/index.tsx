import { Mode, QuestionType } from "@oute/oute-ds.core.constants";
import ZipCodeSettings from "../questions/zip-code/zip-code-general-settings";
import PhoneNumberSettings from "../questions/phone-number/phone-number-general-settings";
import EmailSettings from "../questions/email/email-general-settings";
import DropDownSettings from "../questions/drop-down/drop-down-general-settings";
import YesNoSettings from "../questions/yes-no/yes-no-general-settings";
import RankingSettings from "../questions/ranking/ranking-general-settings";
import MCQSettings from "../questions/mcq/mcq-general-settings";
import SCQSettings from "../questions/scq/scq-general-settings";
import EndingSettings from "../questions/ending/ending-general-settings";
import DateSettings from "../questions/date/date-general-settings";
import CurrencySettings from "../questions/currency/currency-general-settings";
import NumberSettings from "../questions/number/number-general-settings";
import FilePickerSettings from "../questions/file-picker/file-picker-general-settings";
import QuoteSettings from "../questions/quote-settings/quote-general-settings";
import WelcomeSettings from "../questions/welcome/welcome-general-settings";
import TimeSettings from "../questions/time/time-general-settings";
import SignatureSettings from "../questions/signature/signature-general-settings";
import AddressSettings from "../questions/address/address-general-settings";
import PdfViewerSettings from "../questions/pdf-viewer/pdf-viewer-general-settings";
import KeyValueTableSettings from "../questions/key-value-table/key-value-table-general-settings";
import TextPreviewSettings from "../questions/text-preview/text-preview-general-settings";
import AutocompleteSettings from "../questions/autocomplete-settings/autocomplete-general-settings";
import LongTextGeneralSettings from "../questions/long-text/long-text-general-settings";
import ShortTextGeneralSettings from "../questions/short-text/short-text-general-settings";
import MultiQuestionPageSettings from "../questions/multi-question-page/multi-question-page-general-settings";
import LoadingSettings from "../questions/loading/loading-general-settings";
import { wrapperContainer } from "../../styles";
import FormulaBarGeneralSettings from "../questions/formula-bar/formula-bar-general-settings";
import QuestionsGridGeneralSettings from "../questions/questions-grid/autocomplete-general-settings";
import PictureGeneralSettings from "../questions/picture/picture-general-settings";
import QuestionRepeatorGeneralSettings from "../questions/question-repeator/question-repeator-general-settings";
import CollectPaymentsGeneralSettings from "../questions/collect-payments/collect-payments-general-settings";
import RatingGeneralSettings from "../questions/rating/rating-general-settings";
import SliderGeneralSettings from "../questions/slider/slider-general-settings";
import OpinionScaleGeneralSettings from "../questions/opinion-scale/opinion-scale-general-settings";
import LegalTermsGeneralSettings from "../questions/legal-terms/legal-terms-general-settings";
import StripePaymentGeneralSettings from "../questions/stripe-payment/stripe-payment-general-settings";
const settingsComponents = {
  [QuestionType.SHORT_TEXT]: ShortTextGeneralSettings,
  [QuestionType.LONG_TEXT]: LongTextGeneralSettings,
  [QuestionType.EMAIL]: EmailSettings,
  [QuestionType.ZIP_CODE]: ZipCodeSettings,
  [QuestionType.PHONE_NUMBER]: PhoneNumberSettings,
  [QuestionType.CURRENCY]: CurrencySettings,
  [QuestionType.SIGNATURE]: SignatureSettings,
  [QuestionType.DATE]: DateSettings,
  [QuestionType.TIME]: TimeSettings,
  [QuestionType.NUMBER]: NumberSettings,
  [QuestionType.DROP_DOWN]: DropDownSettings,
  [QuestionType.YES_NO]: YesNoSettings,
  [QuestionType.RANKING]: RankingSettings,
  [QuestionType.MCQ]: MCQSettings,
  [QuestionType.SCQ]: SCQSettings,
  [QuestionType.FILE_PICKER]: FilePickerSettings,
  [QuestionType.PDF_VIEWER]: PdfViewerSettings,
  [QuestionType.TEXT_PREVIEW]: TextPreviewSettings,
  [QuestionType.ADDRESS]: AddressSettings,
  [QuestionType.WELCOME]: WelcomeSettings,
  [QuestionType.ENDING]: EndingSettings,
  [QuestionType.QUOTE]: QuoteSettings,
  [QuestionType.AUTOCOMPLETE]: AutocompleteSettings,
  [QuestionType.KEY_VALUE_TABLE]: KeyValueTableSettings,
  [QuestionType.MULTI_QUESTION_PAGE]: MultiQuestionPageSettings,
  [QuestionType.LOADING]: LoadingSettings,
  [QuestionType.FORMULA_BAR]: FormulaBarGeneralSettings,
  [QuestionType.QUESTIONS_GRID]: QuestionsGridGeneralSettings,
  [QuestionType.PICTURE]: PictureGeneralSettings,
  [QuestionType.QUESTION_REPEATER]: QuestionRepeatorGeneralSettings,
  [QuestionType.COLLECT_PAYMENT]: CollectPaymentsGeneralSettings,
  [QuestionType.RATING]: RatingGeneralSettings,
  [QuestionType.SLIDER]: SliderGeneralSettings,
  [QuestionType.OPINION_SCALE]: OpinionScaleGeneralSettings,
  [QuestionType.TERMS_OF_USE]: LegalTermsGeneralSettings,
  [QuestionType.STRIPE_PAYMENT]: StripePaymentGeneralSettings,
};

export const GeneralSettings = ({
  question,
  onChange,
  mode,
  viewPort,
  variables,
  isMultiQuestionType,
  workspaceId,
  setQuestion,
}: any) => {
  const Component = settingsComponents[question?.type];

  if (!Component) return null;

  return (
    <div style={wrapperContainer()}>
      <Component
        question={question}
        onChange={onChange}
        mode={mode}
        viewPort={viewPort}
        variables={variables}
        disableQuestionAlignment={isMultiQuestionType || mode !== Mode.CARD}
        workspaceId={workspaceId}
        setQuestion={setQuestion}
      />
    </div>
  );
};
