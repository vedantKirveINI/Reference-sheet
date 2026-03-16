import { CellType } from "@/types";

// TODO: Move CDN_BASE_URL to env (e.g. VITE_CONTENT_BASE_URL)
const CDN_BASE_URL = "https://cdn-v1.tinycommand.com";

export const CONTACT_PHONE_ICON = `${CDN_BASE_URL}/1234567890/1741762129628/Address-black.svg`;
export const MAIL_OUTLINE_ICON = `${CDN_BASE_URL}/1234567890/1741760530699/Email-black.svg`;
export const MCQ_ICON = `${CDN_BASE_URL}/1234567890/1741761589947/Mcq-black.svg`;
export const PHONE_ICON = `${CDN_BASE_URL}/1234567890/1741760967713/PhoneNumber-black.svg`;
export const TIME_ICON = `${CDN_BASE_URL}/1234567890/1741760082965/Time-black.svg`;
export const YES_NO_ICON = `${CDN_BASE_URL}/1234567890/1741761365360/YesNo-black.svg`;
export const CALENDER_ICON = `${CDN_BASE_URL}/1234567890/1741760179749/Date-black.svg`;
export const CURRENCY_ICON = `${CDN_BASE_URL}/1234567890/1741759302457/Currency-black.svg`;

export const FILE_UPLOAD_ICON = `${CDN_BASE_URL}/1234567890/1741759812576/Filepicker-black.svg`;
export const HASH_ICON = `${CDN_BASE_URL}/1234567890/1741759605326/Number-black.svg`;
export const LOCATION_ICON = `${CDN_BASE_URL}/1234567890/1741760875136/Zipcode-black.svg`;
export const LONG_TEXT_ICON = `${CDN_BASE_URL}/1234567890/1741761703117/LongText-black.svg`;
export const SHORT_TEXT_ICON = `${CDN_BASE_URL}/1234567890/1741761897530/Short-text-black.svg`;
export const SINGLE_CHOICE_ICON = `${CDN_BASE_URL}/1234567890/1742541141311/SingleChoice-black.svg`;
export const SIGNATURE_ICON = `${CDN_BASE_URL}/1234567890/1741760405590/Signature-black.svg`;
export const DROPDOWN_STATIC_ICON = `${CDN_BASE_URL}/1234567890/1741761077015/Dropdown-black.svg`;
export const RANKING_ICON = `${CDN_BASE_URL}/1234567890/1741760620438/Ranking-black.svg`;
export const FORMULA_ICON = `${CDN_BASE_URL}/1234567890/1748944544593/FxRoundedBlack.svg`;
export const ENRICHMENT_ICON = `${CDN_BASE_URL}/1234567890/1753335891440/Enhancement-icon.svg`;
export const LIST_ICON = `${CDN_BASE_URL}/1234567890/1755002704385/icon-black.svg`;
export const CREATED_TIME_ICON = `${CDN_BASE_URL}/1234567890/1757669726951/calender_clock.svg`;
export const RATING_ICON = `${CDN_BASE_URL}/1234567890/1756817171072/rating-icon.svg`;
export const SLIDER_ICON = `${CDN_BASE_URL}/1234567890/1762326867882/slider.svg`;
export const OPINION_SCALE_ICON = `${CDN_BASE_URL}/1234567890/1762326865834/opinion%20scale.svg`;

export const CELL_TYPE_CDN_ICONS: Partial<Record<CellType, string>> = {
  [CellType.String]: SHORT_TEXT_ICON,
  [CellType.LongText]: LONG_TEXT_ICON,
  [CellType.Number]: HASH_ICON,
  [CellType.Currency]: CURRENCY_ICON,
  [CellType.DateTime]: CALENDER_ICON,
  [CellType.CreatedTime]: CREATED_TIME_ICON,
  [CellType.Time]: TIME_ICON,
  [CellType.SCQ]: SINGLE_CHOICE_ICON,
  [CellType.MCQ]: MCQ_ICON,
  [CellType.DropDown]: DROPDOWN_STATIC_ICON,
  [CellType.YesNo]: YES_NO_ICON,
  [CellType.Email]: MAIL_OUTLINE_ICON,
  [CellType.Rating]: RATING_ICON,
  [CellType.Ranking]: RANKING_ICON,
  [CellType.PhoneNumber]: PHONE_ICON,
  [CellType.Address]: CONTACT_PHONE_ICON,
  [CellType.FileUpload]: FILE_UPLOAD_ICON,
  [CellType.Signature]: SIGNATURE_ICON,
  [CellType.Slider]: SLIDER_ICON,
  [CellType.OpinionScale]: OPINION_SCALE_ICON,
  [CellType.List]: LIST_ICON,
  [CellType.ZipCode]: LOCATION_ICON,
};

