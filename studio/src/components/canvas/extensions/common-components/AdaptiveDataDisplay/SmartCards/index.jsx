import React from "react";
import AddressCard from "./AddressCard";
import ConnectionCard from "./ConnectionCard";
import CredentialsCard from "./CredentialsCard";
import KeyValueCard from "./KeyValueCard";

export const SmartCardRenderer = ({ schemaType, data, label, accentColor, inputStyle }) => {
  switch (schemaType) {
    case "address":
      return <AddressCard data={data} label={label} accentColor={accentColor} />;
    case "connection":
      return <ConnectionCard data={data} label={label} accentColor={accentColor} />;
    case "credentials":
      return <CredentialsCard data={data} label={label} accentColor={accentColor} />;
    default:
      return <KeyValueCard data={data} label={label} accentColor={accentColor} inputStyle={inputStyle} />;
  }
};

export { AddressCard, ConnectionCard, CredentialsCard, KeyValueCard };
