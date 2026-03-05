import { countries } from "@oute/oute-ds.core.constants";

const toString = (address) => {
  const { country, addressLineOne, addressLineTwo, city, zipCode, state } =
    address;
  const requiredFields = [
    country,
    addressLineOne,
    addressLineTwo,
    city,
    zipCode,
    state,
  ];
  const allFieldsPresent = requiredFields.every(
    (value) => value && value.trim() !== ""
  );

  if (!allFieldsPresent) {
    return "";
  }

  return `${addressLineOne}, ${addressLineTwo}, ${city} - ${zipCode}, ${state}, ${country}`;
};

const getCountryCode = (countryName: string) => {
  if (!countryName) return "IN";
  const country = Object.values(countries).find(
    (c) => c?.countryName?.toLowerCase?.() === countryName?.toLowerCase?.()
  );
  return country?.countryCode ?? "IN";
};

export { toString, getCountryCode };
