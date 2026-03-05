// Local Module Exports - Central Index
// This replaces all external @oute/oute-ds.* package imports

// ============ SKELETON/COMPLEX COMPONENTS ============
export { QuestionFiller } from "./question-filler";
export { QuestionCreator } from "./question-creator";
export { QuestionPreview } from "./question-preview";
export { QuestionRenderer as QuestionV2 } from "./question-v2";
export { QuestionSettings as SettingsFooter } from "./settings-footer";
export { QuestionData } from "./question-data";
export { QuestionAugmentor } from "./question-augmentor";
export { AnswerSection } from "./answer-section";
export { QuestionSection } from "./question-section";

// ============ MOLECULE/FORM COMPONENTS ============
export { LongText } from "./long-text";
export { ShortText } from "./short-text";
export { CreatorMCQOptionsGroup as MCQ } from "./mcq";
export { YesNo } from "./yes-no";
export { PdfViewer as PDFViewer } from "./pdf-viewer";
export { TextPreview } from "./text-preview";
export { Signature } from "./signature";
export { Rating } from "./rating";
export { Slider } from "./slider";
export { OpinionScale } from "./opinion-scale";
export { PictureCreator as Picture } from "./picture";
export { PictureFiller } from "./picture";
export { FillerSCQ } from "./filler-scq";
export { FillerMCQOptionsGroup } from "./filler-mcq-options-group";
export { CollectPayment } from "./collect-payment";
export { StripePayment } from "./stripe-payment";
export { LegalTerms as TermsOfUse } from "./terms-of-use";

// ============ COMMON COMPONENTS ============
export { default as HelpAndResources } from "./help-and-resources";
export { default as JumpToNode } from "./jump-to-node";
export { default as ParamsComponent } from "./params-component";
export { Terminal } from "./terminal";
export { Integration as IntegrationV2 } from "./integration-v2";
export { default as Search } from "./search";

// ============ CORE UTILITIES ============
export * as constants from "./constants";
export * as contexts from "./contexts";
export * as utils from "./utils";

// ============ THEME ============
// Theme Manager V2 - Typeform-style design panel with Logo/Font/Buttons/Background tabs
export { default as ThemeManager } from "@/module/panels/ThemeManager/ThemeManagerPanelWrapper";
export { DEFAULT_THEME, GALLERY_THEMES } from "@/module/panels/ThemeManager/constants";

// ============ OTHER FORM ELEMENTS ============
export { Address } from "./address";
export { Autocomplete } from "./autocomplete";
export { CloudFileExplorer as CloudFilePicker } from "./cloud-file-picker";
export { ColorPicker } from "./color-picker";
export { ConditionComposer } from "./condition-composer";
export { ConditionComposerV2 } from "./condition-composer-v2";
export { Connection } from "./connection";
export { CountryPicker } from "./country-picker";
export { Currency } from "./currency";
export { Date } from "./date";
export { DateInput } from "./date-input";
export { default as Drawer } from "./drawer";
export { DrawerShell, DrawerHeader, DrawerBody, DrawerFooter } from "./drawer-wrappers";
export { Dropdown } from "./dropdown";
export { Editor } from "./editor";
export { Email } from "./email";
export { Ending } from "./ending";
export { Error } from "./error";
export { FilePicker } from "./file-picker";
export { HelperOverlay } from "./helper-overlay";
export { ImagePicker } from "./image-picker";
export { InfoCard } from "./info-card";
export { InputGrid } from "./input-grid";
/** @deprecated Use InputGridV3 instead */
export { default as InputGridV2 } from "./input-grid-v2";
export { default as InputGridV3 } from "./input-grid-v3";
export { KeyValueTable } from "./key-value-table";
export { Loading } from "./loading";
export { MultiQuestionPage } from "./multi-question-page";
export { NullScreen } from "./null-screen";
export { Number } from "./number";
export { PhoneNumber } from "./phone-number";
export { QuestionRepeator as QuestionRepeater } from "./question-repeater";
export { QuestionsGrid } from "./questions-grid";
export { RadioInput as Radio } from "./radio";
export { Ranker } from "./ranker";
export { Ranking } from "./ranking";
export { Simpleinput as SimpleInput } from "./simpleinput";
export { TabBar as Tabs } from "./tabs";
export { TextArea } from "./text-area";
export { TextField } from "./text-field";
export { Time } from "./time";
export { default as TinyAuthWrapper } from "./tiny-auth-wrapper";
export { TinyCookieConsentProvider as TinyCookieConsent } from "./tiny-cookie-consent";
export { Welcome } from "./welcome";
export { WrappedEditor } from "./wrappededitor";
export { ZipCode } from "./zip-code";

// ============ IC CONNECTION/DEPLOYMENT STUBS ============
// These replace external @oute/ic* packages that depend on MUI
export { AUTH_TYPES, CreateEventConnection } from "./ic-connection";
export { CommonAccountActions, TestCaseRun, TestCaseSetup } from "./ic-deployment";
