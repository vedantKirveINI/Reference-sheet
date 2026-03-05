import { QuestionType } from "@oute/oute-ds.core.constants";
import { styles } from "./styles";
import ShortTextSettings from "./settings/ShortTextSettings";
import LongTextSettings from "./settings/LongTextSettings";
import EmailSettings from "./settings/EmailSettings";
import PhoneSettings from "./settings/PhoneSettings";
import NumberSettings from "./settings/NumberSettings";
import DateSettings from "./settings/DateSettings";
import MCQSettings from "./settings/MCQSettings";
import SCQSettings from "./settings/SCQSettings";
import DropdownSettings from "./settings/DropdownSettings";
import AddressSettings from "./settings/AddressSettings";
import CurrencySettings from "./settings/CurrencySettings";
import ZipCodeSettings from "./settings/ZipCodeSettings";
import YesNoSettings from "./settings/YesNoSettings";
import RatingSettings from "./settings/RatingSettings";
import OpinionScaleSettings from "./settings/OpinionScaleSettings";
import SliderSettings from "./settings/SliderSettings";
import RankingSettings from "./settings/RankingSettings";
import SignatureSettings from "./settings/SignatureSettings";
import FilePickerSettings from "./settings/FilePickerSettings";
import TimeSettings from "./settings/TimeSettings";
import WelcomeSettings from "./settings/WelcomeSettings";
import EndingSettings from "./settings/EndingSettings";
import LegalTermsSettings from "./settings/LegalTermsSettings";
import TextPreviewSettings from "./settings/TextPreviewSettings";
import AutocompleteSettings from "./settings/AutocompleteSettings";
import PDFViewerSettings from "./settings/PDFViewerSettings";
import PictureSettings from "./settings/PictureSettings";
import QuoteSettings from "./settings/QuoteSettings";
import LoadingSettings from "./settings/LoadingSettings";
import QuestionsGridSettings from "./settings/QuestionsGridSettings";
import KeyValueTableSettings from "./settings/KeyValueTableSettings";
import FormulaBarSettings from "./settings/FormulaBarSettings";
import QuestionRepeaterSettings from "./settings/QuestionRepeaterSettings";
import MultiQuestionPageSettings from "./settings/MultiQuestionPageSettings";
import CollectPaymentsSettings from "./settings/CollectPaymentsSettings";
import StripePaymentSettings from "./settings/StripePaymentSettings";

interface SettingsTabProps {
  question: any;
  onChange: (val: any) => void;
  mode?: any;
  viewPort?: any;
  variables?: any;
  workspaceId?: string;
  setQuestion?: (val: any) => void;
  highlightDataSource?: boolean;
}

const settingsComponents: Record<string, React.ComponentType<any>> = {
  [QuestionType.SHORT_TEXT]: ShortTextSettings,
  [QuestionType.LONG_TEXT]: LongTextSettings,
  [QuestionType.EMAIL]: EmailSettings,
  [QuestionType.PHONE_NUMBER]: PhoneSettings,
  [QuestionType.NUMBER]: NumberSettings,
  [QuestionType.DATE]: DateSettings,
  [QuestionType.MCQ]: MCQSettings,
  [QuestionType.SCQ]: SCQSettings,
  [QuestionType.DROP_DOWN]: DropdownSettings,
  [QuestionType.DROP_DOWN_STATIC]: DropdownSettings,
  [QuestionType.ADDRESS]: AddressSettings,
  [QuestionType.CURRENCY]: CurrencySettings,
  [QuestionType.ZIP_CODE]: ZipCodeSettings,
  [QuestionType.YES_NO]: YesNoSettings,
  [QuestionType.RATING]: RatingSettings,
  [QuestionType.OPINION_SCALE]: OpinionScaleSettings,
  [QuestionType.SLIDER]: SliderSettings,
  [QuestionType.RANKING]: RankingSettings,
  [QuestionType.SIGNATURE]: SignatureSettings,
  [QuestionType.FILE_PICKER]: FilePickerSettings,
  [QuestionType.TIME]: TimeSettings,
  [QuestionType.WELCOME]: WelcomeSettings,
  [QuestionType.ENDING]: EndingSettings,
  [QuestionType.LEGAL_TERMS]: LegalTermsSettings,
  [QuestionType.TERMS_OF_USE]: LegalTermsSettings,
  [QuestionType.TEXT_PREVIEW]: TextPreviewSettings,
  [QuestionType.AUTOCOMPLETE]: AutocompleteSettings,
  [QuestionType.PDF_VIEWER]: PDFViewerSettings,
  [QuestionType.PICTURE]: PictureSettings,
  [QuestionType.QUOTE]: QuoteSettings,
  [QuestionType.LOADING]: LoadingSettings,
  [QuestionType.QUESTIONS_GRID]: QuestionsGridSettings,
  [QuestionType.KEY_VALUE_TABLE]: KeyValueTableSettings,
  [QuestionType.FORMULA_BAR]: FormulaBarSettings,
  [QuestionType.QUESTION_REPEATER]: QuestionRepeaterSettings,
  [QuestionType.MULTI_QUESTION_PAGE]: MultiQuestionPageSettings,
  [QuestionType.COLLECT_PAYMENTS]: CollectPaymentsSettings,
  [QuestionType.STRIPE_PAYMENT]: StripePaymentSettings,
};

const SettingsTab = ({
  question,
  onChange,
  mode,
  viewPort,
  variables,
  workspaceId,
  setQuestion,
  highlightDataSource,
}: SettingsTabProps) => {
  const Component = settingsComponents[question?.type];

  if (!Component) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          No settings available for this question type.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Component
        question={question}
        onChange={onChange}
        mode={mode}
        viewPort={viewPort}
        variables={variables}
        workspaceId={workspaceId}
        setQuestion={setQuestion}
        highlightDataSource={highlightDataSource}
      />
    </div>
  );
};

export default SettingsTab;
