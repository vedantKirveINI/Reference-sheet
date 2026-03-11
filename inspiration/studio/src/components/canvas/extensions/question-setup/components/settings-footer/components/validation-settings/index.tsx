import { QuestionType } from "@oute/oute-ds.core.constants";
import DateAdvancedSettings from "../questions/date/date-advanced-settings";
import ShortTextAdvancedSettings from "../questions/short-text/short-text-advanced-settings";
import LongTextAdvancedSettings from "../questions/long-text/long-text-advanced-settings";
import EmailAdvancedSettings from "../questions/email/email-advanced-settings";
import AddressAdvancedSettings from "../questions/address/address-advanced-settings";
import RankingAdvancedSettings from "../questions/ranking/ranking-advanced-settings";
import AutoCompleteAdvancedSettings from "../questions/autocomplete-settings/autocomplete-advanced-settings";
import CurrencyAdvancedSettings from "../questions/currency/currency-advanced-settings";
import DropDownAdvancedSettings from "../questions/drop-down/drop-down-advanced-settings";
import FilePickerAdvancedSettings from "../questions/file-picker/file-picker-advanced-settings";
import KeyValueTableAdvancedSettings from "../questions/key-value-table/key-value-table-advanced-settings";
import McqAdvancedSettings from "../questions/mcq/mcq-advanced-settings";
import PhoneNumberAdvancedSettings from "../questions/phone-number/phone-number-advanced-settings";
import NumberAdvancedSettings from "../questions/number/number-advanced-settings";
import SignatureAdvancedSettings from "../questions/signature/signature-advanced-settings";
import TimeAdvancedSettings from "../questions/time/time-advanced-settings";
import ScqAdvancedSettings from "../questions/scq/scq-advanced-settings";
import YesNoAdvancedSettings from "../questions/yes-no/yes-no-advanced-settings";
import ZipCodeAdvancedSettings from "../questions/zip-code/zip-code-advanced-settings";
import MultiQuestionPageAdvanceSettings from "../questions/multi-question-page/multi-question-page-advance-settings";

import { wrapperContainer } from "../../styles";
import QuestionRepeatorAdvanceSettings from "../questions/question-repeator/question-repeator-advanced-settings";
import FormulaBarAdvancedSettings from "../questions/formula-bar/formula-bar-advanced-settings";
import SliderAdvancedSettings from "../questions/slider/slider-advanced-settings";
const settingsComponents = {
  [QuestionType.SHORT_TEXT]: ShortTextAdvancedSettings,
  [QuestionType.LONG_TEXT]: LongTextAdvancedSettings,
  [QuestionType.EMAIL]: EmailAdvancedSettings,
  [QuestionType.NUMBER]: NumberAdvancedSettings,
  [QuestionType.MCQ]: McqAdvancedSettings,
  [QuestionType.SCQ]: ScqAdvancedSettings,
  [QuestionType.YES_NO]: YesNoAdvancedSettings,
  [QuestionType.DROP_DOWN]: DropDownAdvancedSettings,
  [QuestionType.RANKING]: RankingAdvancedSettings,
  [QuestionType.PHONE_NUMBER]: PhoneNumberAdvancedSettings,
  [QuestionType.ZIP_CODE]: ZipCodeAdvancedSettings,
  [QuestionType.CURRENCY]: CurrencyAdvancedSettings,
  [QuestionType.DATE]: DateAdvancedSettings,
  [QuestionType.TIME]: TimeAdvancedSettings,
  [QuestionType.FILE_PICKER]: FilePickerAdvancedSettings,
  [QuestionType.ADDRESS]: AddressAdvancedSettings,
  [QuestionType.AUTOCOMPLETE]: AutoCompleteAdvancedSettings,
  [QuestionType.KEY_VALUE_TABLE]: KeyValueTableAdvancedSettings,
  [QuestionType.SIGNATURE]: SignatureAdvancedSettings,
  [QuestionType.MULTI_QUESTION_PAGE]: MultiQuestionPageAdvanceSettings,
  [QuestionType.QUESTION_REPEATER]: QuestionRepeatorAdvanceSettings,
  [QuestionType.FORMULA_BAR]: FormulaBarAdvancedSettings,
  [QuestionType.SLIDER]: SliderAdvancedSettings,
};

export const ValidationSettings = ({ question, onChange, setQuestion }) => {
  const Component = settingsComponents[question?.type];

  const handleOnChange = (key: string, value: any) => {
    onChange({ settings: { ...question?.settings, [key]: value } });
  };

  if (!Component) {
    return <>No Settings available</>;
  }

  return (
    <div style={wrapperContainer}>
      <Component
        settings={question?.settings}
        handleOnChange={handleOnChange}
        onChange={onChange}
        setQuestion={setQuestion}
      />
    </div>
  );
};
