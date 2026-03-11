import React from "react";
import { QuestionType } from "@oute/oute-ds.core.constants";
import { countryInputStyles } from "./styles";
export const CountryInputAnswerRender = ({ type, value }) => {
  return (
    <div style={countryInputStyles.countryInputContainer}>
      <img
        src={`https://ccc.oute.app/country-flags/${
          value?.response?.countryCode
        }.svg`}
        width="20"
        alt=""
      />
      {type === QuestionType.PHONE_NUMBER && (
        <p style={countryInputStyles.text({ showFullText: false })}>
          +{value?.response?.countryNumber} {value?.response?.phoneNumber}
        </p>
      )}
      {type === QuestionType.ZIP_CODE && (
        <p style={countryInputStyles.text({ showFullText: false })}>
          {value?.response?.zipCode}
        </p>
      )}
      {type === QuestionType.CURRENCY && (
        <p style={countryInputStyles.text({ showFullText: false })}>
          {value?.response?.currencySymbol}
          {value?.response?.currencyValue}
        </p>
      )}
    </div>
  );
};
