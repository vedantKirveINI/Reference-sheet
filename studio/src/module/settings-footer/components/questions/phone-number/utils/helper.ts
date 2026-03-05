import { countries } from "@oute/oute-ds.core.constants";

export const getCountryNameByCountryCode = (code: string): string => {
  return countries[code || "IN"].countryName;
};
