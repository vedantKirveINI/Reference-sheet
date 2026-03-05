import {
  formatConfigs,
  DateFormat,
  DateFormatSeparator,
  FormattedDateString,
} from "@oute/oute-ds.common.core.utils";

interface GetConfigParams {
  format: DateFormat;
  separator: DateFormatSeparator;
}

export const getPlaceholder = ({
  format,
  separator,
}: GetConfigParams): FormattedDateString<DateFormatSeparator> => {
  return formatConfigs[format].placeholder(separator);
};

export const getMask = ({ format, separator }: GetConfigParams): string => {
  return formatConfigs[format].mask(separator);
};
