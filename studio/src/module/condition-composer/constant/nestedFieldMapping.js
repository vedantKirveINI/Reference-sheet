const NESTED_FIELD_MAPPING = {
  ADDRESS: [
    { label: "Address Line 1", key: "addressLineOne" },
    { label: "Address Line 2", key: "addressLineTwo" },
    { label: "City", key: "city" },
    { label: "State", key: "state" },
    { label: "Country", key: "country" },
    { label: "Zipcode", key: "zipCode" },
  ],
  PHONE_NUMBER: [
    { label: "Country", key: "countryNumber" },
    { label: "Country Code", key: "countryCode" },
    { label: "Number", key: "phoneNumber" },
  ],
};

export default NESTED_FIELD_MAPPING;
